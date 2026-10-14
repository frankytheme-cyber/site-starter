/**
 * a11y (suite qa): axe-core su ogni pagina della build, a 375 e 1280 px.
 * Violazioni serious o critical = errore; moderate e minor = avviso.
 */
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';
import { type CheckContext, collector } from './lib/report.ts';
import { builtPages } from './lib/project.ts';

export const VIEWPORTS = [
	{ name: '375px', width: 375, height: 800 },
	{ name: '1280px', width: 1280, height: 900 },
];

export async function a11y({ baseUrl }: CheckContext) {
	const { findings, error, warning } = collector('a11y');
	if (!baseUrl) throw new Error('serve il server di anteprima');
	const browser = await chromium.launch();
	try {
		for (const viewport of VIEWPORTS) {
			const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
			const page = await context.newPage();
			for (const path of builtPages()) {
				await page.goto(new URL(path, baseUrl).href, { waitUntil: 'load' });
				const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
				for (const violation of violations) {
					const serious = violation.impact === 'serious' || violation.impact === 'critical';
					const targets = violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join(' · ');
					(serious ? error : warning)({
						where: `${path} @${viewport.name}`,
						message: `${violation.help} [${violation.id}, ${violation.impact}] su ${violation.nodes.length} elementi`,
						hint: `${targets} — ${violation.helpUrl}`,
					});
				}
			}
			await context.close();
		}
	} finally {
		await browser.close();
	}
	return findings;
}
