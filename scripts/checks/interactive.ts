/**
 * interactive (suite qa): i componenti interattivi si usano da tastiera (docs/blocchi-interattivi.md).
 * - header @375: Invio apre il menu, focus nel dialog, Esc chiude, focus di ritorno, scroll bloccato e sbloccato;
 *   il pulsante Chiudi funziona da tastiera. @1280: sottomenu con Invio, Tab, Esc.
 * - accordion: Invio e Spazio sul titolo aprono e chiudono; con single, aprirne una chiude le altre.
 * - tabs @1280: frecce, Home/End, tabindex mobile, un pannello visibile alla volta. @375: accordion al posto delle schede.
 * - carousel: freccia successiva e pallini (aria-current), freccia precedente disabilitata all'inizio, niente autoplay.
 * Ogni componente si prova sulla prima pagina che lo contiene (prima le pagine del sito, poi il catalogo).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Browser, chromium, type Page } from 'playwright';
import { type CheckContext, collector } from './lib/report.ts';
import { builtPages, DIST } from './lib/project.ts';

const MOBILE = { width: 375, height: 800 };
const DESKTOP = { width: 1280, height: 900 };

/** La prima pagina il cui HTML contiene l'elemento (attributo vero, non il CSS globale del componente). */
function pageWith(pattern: RegExp): string | undefined {
	const matching = builtPages().filter((path) => pattern.test(readFileSync(join(DIST, path, 'index.html'), 'utf8')));
	return matching.find((path) => !path.startsWith('/catalogo/')) ?? matching[0];
}

export async function interactive({ baseUrl }: CheckContext) {
	const { findings, error, warning } = collector('interactive');
	if (!baseUrl) throw new Error('serve il server di anteprima');

	// Gli eventi (toggle, close, scroll) arrivano come task successivi: si aspetta che la pagina si assesti.
	const press = async (page: Page, key: string) => {
		await page.keyboard.press(key);
		await page.waitForTimeout(150);
	};
	const open = async (browser: Browser, path: string, viewport: typeof MOBILE) => {
		const page = await browser.newPage({ viewport });
		await page.goto(new URL(path, baseUrl).href);
		return page;
	};
	const expectFor = (path: string) => (where: string, ok: boolean, message: string) => {
		if (!ok) error({ where: `${path} › ${where}`, message, hint: 'vedi docs/blocchi-interattivi.md (tastiera e focus)' });
	};

	const browser = await chromium.launch();
	try {
		// ------------------------------------------------------------------ header
		const headerPath = pageWith(/<header[^>]*\sdata-header[\s=>]/);
		if (!headerPath) warning({ message: 'nessuna pagina con un header da provare', hint: 'aggiungi il blocco header a una ricetta' });
		else {
			const expect = expectFor(headerPath);
			const mobile = await open(browser, headerPath, MOBILE);
			const opener = mobile.locator('[data-header-open]:visible').first();
			if ((await opener.count()) === 0) error({ where: `${headerPath} @375px`, message: 'pulsante del menu non visibile' });
			else {
				const dialog = mobile.locator(`#${await opener.getAttribute('aria-controls')}`);
				const state = async () => ({
					open: await dialog.evaluate((element) => (element as HTMLDialogElement).open),
					expanded: await opener.getAttribute('aria-expanded'),
					focusInDialog: await dialog.evaluate((element) => element.contains(document.activeElement)),
					focusOnOpener: await opener.evaluate((element) => element === document.activeElement),
					scrollLocked: await mobile.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden'),
				});
				await opener.focus();
				await press(mobile, 'Enter');
				let now = await state();
				expect('menu @375px', now.open, 'Invio sul pulsante non apre il menu');
				expect('menu @375px', now.expanded === 'true', 'aria-expanded non diventa "true" all’apertura');
				expect('menu @375px', now.focusInDialog, 'all’apertura il focus non entra nel menu');
				expect('menu @375px', now.scrollLocked, 'con il menu aperto la pagina scorre ancora');
				await press(mobile, 'Escape');
				now = await state();
				expect('menu @375px', !now.open, 'Esc non chiude il menu');
				expect('menu @375px', now.expanded === 'false', 'aria-expanded non torna "false" alla chiusura');
				expect('menu @375px', now.focusOnOpener, 'dopo Esc il focus non torna al pulsante del menu');
				expect('menu @375px', !now.scrollLocked, 'dopo la chiusura lo scroll resta bloccato');
				await opener.focus();
				await press(mobile, 'Enter');
				await dialog.locator('[data-header-close]').focus();
				await press(mobile, 'Enter');
				now = await state();
				expect('menu @375px', !now.open && now.focusOnOpener, 'il pulsante Chiudi non chiude il menu da tastiera o non riporta il focus');
			}
			await mobile.close();

			const desktop = await open(browser, headerPath, DESKTOP);
			const toggle = desktop.locator('[data-header-toggle]:visible').first();
			if ((await toggle.count()) === 0) warning({ where: `${headerPath} @1280px`, message: 'nessun sottomenu da provare' });
			else {
				const submenu = desktop.locator(`#${await toggle.getAttribute('aria-controls')}`);
				await toggle.focus();
				await press(desktop, 'Enter');
				expect('sottomenu @1280px', (await toggle.getAttribute('aria-expanded')) === 'true', 'Invio non apre il sottomenu (aria-expanded)');
				expect('sottomenu @1280px', await submenu.isVisible(), 'il sottomenu non diventa visibile');
				await press(desktop, 'Tab');
				expect('sottomenu @1280px', await submenu.evaluate((element) => element.contains(document.activeElement)), 'Tab non porta il focus dentro il sottomenu');
				await press(desktop, 'Escape');
				expect('sottomenu @1280px', !(await submenu.isVisible()), 'Esc non chiude il sottomenu');
				expect('sottomenu @1280px', await toggle.evaluate((element) => element === document.activeElement), 'dopo Esc il focus non torna al pulsante del sottomenu');
			}
			await desktop.close();
		}

		// ------------------------------------------------------------------ accordion
		const accordionPath = pageWith(/<div[^>]*\sdata-accordion[\s=>]/);
		if (!accordionPath) warning({ message: 'nessuna pagina con un accordion da provare' });
		else {
			const expect = expectFor(accordionPath);
			const page = await open(browser, accordionPath, DESKTOP);
			const accordion = page.locator('[data-accordion][data-single]:visible').first();
			const target = (await accordion.count()) > 0 ? accordion : page.locator('[data-accordion]:visible').first();
			const items = target.locator(':scope > [data-accordion-item]');
			const isOpen = (index: number) => items.nth(index).evaluate((element) => (element as HTMLDetailsElement).open);
			const summary = (index: number) => items.nth(index).locator(':scope > summary');

			const before = await isOpen(0);
			await summary(0).focus();
			await press(page, 'Enter');
			expect('accordion', (await isOpen(0)) !== before, 'Invio sul titolo non apre o chiude la voce');
			await press(page, ' ');
			expect('accordion', (await isOpen(0)) === before, 'Spazio sul titolo non apre o chiude la voce');

			if ((await accordion.count()) > 0 && (await items.count()) > 1) {
				if (!(await isOpen(0))) {
					await summary(0).focus();
					await press(page, 'Enter');
				}
				await summary(1).focus();
				await press(page, 'Enter');
				expect('accordion single', (await isOpen(1)) && !(await isOpen(0)), 'con single, aprire una voce non chiude le altre');
			}
			await page.close();
		}

		// ------------------------------------------------------------------ tabs
		const tabsPath = pageWith(/<div[^>]*\sdata-tabs[\s=>]/);
		if (!tabsPath) warning({ message: 'nessuna pagina con schede da provare' });
		else {
			const expect = expectFor(tabsPath);
			const desktop = await open(browser, tabsPath, DESKTOP);
			const list = desktop.locator('[role="tablist"]:visible').first();
			if ((await list.count()) === 0) error({ where: `${tabsPath} @1280px`, message: 'tablist non visibile: lo script delle schede non è partito' });
			else {
				const tabs = list.locator('[role="tab"]');
				const count = await tabs.count();
				const panelOf = async (index: number) => desktop.locator(`#${await tabs.nth(index).getAttribute('aria-controls')}`);
				const selected = async () => {
					for (let i = 0; i < count; i++) if ((await tabs.nth(i).getAttribute('aria-selected')) === 'true') return i;
					return -1;
				};
				const roving = async (index: number) => {
					for (let i = 0; i < count; i++) {
						if ((await tabs.nth(i).getAttribute('tabindex')) !== (i === index ? '0' : '-1')) return false;
					}
					return true;
				};
				const check = async (index: number, key: string) => {
					expect(`schede @1280px (${key})`, (await selected()) === index, `dopo ${key} la scheda ${index + 1} non è selezionata (aria-selected)`);
					expect(`schede @1280px (${key})`, await tabs.nth(index).evaluate((element) => element === document.activeElement), `dopo ${key} il focus non è sulla scheda ${index + 1}`);
					expect(`schede @1280px (${key})`, await roving(index), `dopo ${key} tabindex non è 0 solo sulla scheda selezionata`);
					expect(`schede @1280px (${key})`, await (await panelOf(index)).isVisible(), `dopo ${key} il pannello ${index + 1} non è visibile`);
				};
				expect('schede @1280px', (await selected()) === 0 && (await roving(0)), 'all’inizio la prima scheda non è selezionata con tabindex 0');
				expect('schede @1280px', count < 2 || !(await (await panelOf(1)).isVisible()), 'i pannelli non selezionati sono visibili');
				await tabs.first().focus();
				await press(desktop, 'ArrowRight');
				await check(Math.min(1, count - 1), 'freccia destra');
				await press(desktop, 'End');
				await check(count - 1, 'Fine');
				await press(desktop, 'Home');
				await check(0, 'Inizio');
				await press(desktop, 'ArrowLeft');
				await check(count - 1, 'freccia sinistra dalla prima');
			}
			await desktop.close();

			const mobile = await open(browser, tabsPath, MOBILE);
			const tabsRoot = mobile.locator('[data-tabs]').first();
			expect('schede @375px', (await tabsRoot.locator('[role="tablist"]').isVisible()) === false, 'su mobile il tablist è visibile');
			expect('schede @375px', await tabsRoot.locator('[data-accordion]').isVisible(), 'su mobile le schede non diventano un accordion');
			await mobile.close();
		}

		// ------------------------------------------------------------------ carousel
		const carouselPath = pageWith(/<section[^>]*\sdata-carousel[\s=>]/);
		if (!carouselPath) warning({ message: 'nessuna pagina con un carosello da provare' });
		else {
			const expect = expectFor(carouselPath);
			const page = await open(browser, carouselPath, DESKTOP);
			const carousel = page.locator('[data-carousel]').first();
			await carousel.scrollIntoViewIfNeeded();
			const prev = carousel.locator('[data-carousel-prev]');
			const next = carousel.locator('[data-carousel-next]');
			const dots = carousel.locator('[data-carousel-dots] button');
			const track = carousel.locator('[data-carousel-track]');
			const current = async () => {
				for (let i = 0; i < (await dots.count()); i++) if ((await dots.nth(i).getAttribute('aria-current')) === 'true') return i;
				return -1;
			};
			if (!(await next.isVisible())) error({ where: carouselPath, message: 'frecce del carosello non visibili: lo script non è partito' });
			else {
				expect('carosello', (await dots.count()) > 1, 'meno di due pallini');
				expect('carosello', (await dots.first().getAttribute('aria-label')) !== null, 'i pallini non hanno aria-label');
				expect('carosello', (await next.getAttribute('aria-label')) !== null && (await prev.getAttribute('aria-label')) !== null, 'le frecce non hanno aria-label');
				expect('carosello', (await current()) === 0, 'all’inizio il primo pallino non ha aria-current');
				expect('carosello', await prev.isDisabled(), 'all’inizio la freccia precedente non è disabilitata');
				const start = await track.evaluate((element) => element.scrollLeft);
				await page.waitForTimeout(2500);
				expect('carosello', (await track.evaluate((element) => element.scrollLeft)) === start, 'il carosello scorre da solo (autoplay)');
				await next.focus();
				await press(page, 'Enter');
				await page.waitForTimeout(800);
				expect('carosello', (await current()) === 1, 'dopo la freccia successiva il secondo pallino non ha aria-current');
				expect('carosello', !(await prev.isDisabled()), 'dopo la freccia successiva la precedente resta disabilitata');
			}
			await page.close();
		}
	} finally {
		await browser.close();
	}
	return findings;
}
