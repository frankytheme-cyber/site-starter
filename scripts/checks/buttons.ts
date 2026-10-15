/**
 * buttons (suite qa): sottolineatura dei pulsanti di core/ui/button, con Playwright.
 * - primary, secondary, ghost: textDecorationLine "none" in hover e con il focus da tastiera;
 * - link: "underline" in hover.
 * Prima della prova la pagina riceve una regola globale che sottolinea i link in hover e focus:
 * button.css deve batterla per specificità. Ogni variante si prova sulla prima pagina che la
 * contiene: /catalogo/bottoni/ nella libreria, le pagine del sito altrove.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { builtPages, DIST } from './lib/project.ts';
import { type CheckContext, collector } from './lib/report.ts';

const EXPECTED = [
	{ variant: 'primary', hover: 'none', focus: 'none' },
	{ variant: 'secondary', hover: 'none', focus: 'none' },
	{ variant: 'ghost', hover: 'none', focus: 'none' },
	{ variant: 'link', hover: 'underline' },
] as const;

/** Regola globale che un tema o un CMS potrebbe aggiungere: non deve arrivare ai pulsanti. */
const HOSTILE_CSS = 'a:hover, a:focus, a:focus-visible, a:active, a:visited, button:hover, button:focus { text-decoration: underline; }';

/** Pulsante «vero»: niente stato forzato del catalogo, non disabilitato. */
const selectorFor = (variant: string) =>
	`.btn[data-variant="${variant}"]:not([data-state]):not([aria-disabled="true"]):not(:disabled)`;

function pageWith(variant: string): string | undefined {
	const pages = builtPages().filter((path) => readFileSync(join(DIST, path, 'index.html'), 'utf8').includes(`data-variant="${variant}"`));
	return pages.find((path) => path === '/catalogo/bottoni/') ?? pages.find((path) => !path.startsWith('/catalogo/')) ?? pages[0];
}

export async function buttons({ baseUrl }: CheckContext) {
	const { findings, error, warning } = collector('buttons');
	if (!baseUrl) throw new Error('serve il server di anteprima');
	const hint = 'vedi src/core/ui/button/button.css: primary, secondary e ghost mai sottolineati, link sottolineato';

	const browser = await chromium.launch();
	try {
		for (const { variant, ...expected } of EXPECTED) {
			const path = pageWith(variant);
			if (!path) {
				warning({ message: `nessuna pagina con un pulsante ${variant} da provare` });
				continue;
			}
			const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
			await page.goto(new URL(path, baseUrl).href);
			await page.addStyleTag({ content: HOSTILE_CSS });
			const button = page.locator(selectorFor(variant)).first();
			if ((await button.count()) === 0 || !(await button.isVisible())) {
				warning({ where: path, message: `nessun pulsante ${variant} visibile da provare` });
				await page.close();
				continue;
			}
			const where = `${path} › ${variant}`;

			await button.scrollIntoViewIfNeeded();
			await button.hover();
			const hover = await button.evaluate((element) => ({ active: element.matches(':hover'), line: getComputedStyle(element).textDecorationLine }));
			if (!hover.active) error({ where, message: 'il pulsante non va in hover sotto il mouse', hint });
			else if (hover.line !== expected.hover) {
				error({ where: `${where} (hover)`, message: `textDecorationLine "${hover.line}", atteso "${expected.hover}"`, hint });
			}

			if ('focus' in expected) {
				// Focus come da tastiera: mouse via, un tasto premuto, poi il focus (che così è :focus-visible).
				await page.mouse.move(0, 0);
				await page.keyboard.press('Shift');
				await button.focus();
				const focus = await button.evaluate((element) => ({ visible: element.matches(':focus-visible'), line: getComputedStyle(element).textDecorationLine }));
				if (!focus.visible) error({ where, message: 'il focus da tastiera non attiva :focus-visible', hint });
				else if (focus.line !== expected.focus) {
					error({ where: `${where} (focus)`, message: `textDecorationLine "${focus.line}", atteso "${expected.focus}"`, hint });
				}
			}
			await page.close();
		}
	} finally {
		await browser.close();
	}
	return findings;
}
