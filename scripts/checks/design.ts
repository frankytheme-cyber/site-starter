/** Regressioni degli strumenti visivi e delle opzioni dei blocchi, nel browser reale. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { settleDesignPage } from '../lib/design-page.ts';
import { type CheckContext, collector } from './lib/report.ts';

export async function design({ baseUrl, isLibrary, reportsDir }: CheckContext) {
	const { findings, error } = collector('design');
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage();
		try {
			await page.setContent('<dialog><img data-gallery-image></dialog>');
			const start = Date.now();
			assert.deepEqual(await settleDesignPage(page, 1500), []);
			assert(Date.now() - start < 1000, 'il popup senza src consuma il timeout');
			await page.route('https://images.test/broken.png', (route) => route.abort());
			await page.setContent('<img src="https://images.test/broken.png" width="100" height="100">');
			assert.equal((await settleDesignPage(page, 1500)).length, 1, 'immagine fallita non segnalata');
			await page.route('https://images.test/pending.png', () => {});
			await page.setContent('<img src="https://images.test/pending.png" width="100" height="100">', { waitUntil: 'domcontentloaded' });
			assert.equal((await settleDesignPage(page, 100)).length, 1, 'immagine ancora pendente non segnalata');
			await page.route('https://images.test/lazy.png', async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 50));
				await route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64') });
			});
			await page.setContent('<div style="height:5000px"></div><img loading="lazy" src="https://images.test/lazy.png">', { waitUntil: 'domcontentloaded' });
			assert.deepEqual(await settleDesignPage(page, 1500), []);
			assert(await page.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth > 0), 'foto lazy non caricata');
		} catch (cause) { error({ where: 'strumenti screenshot', message: (cause as Error).message }); }
		await page.close();

		if (!isLibrary) return findings;
		const fixtures = [
			['hero', 'Split con foto orizzontale'], ['services', 'Card con foto e icone'],
			['gallery', 'Griglia con didascalie visibili'], ['form', 'Contatto con occhiello personalizzato'],
			['cta', 'Recapiti con etichette personalizzate'],
		];
		const dir = join(reportsDir, 'design-qa');
		mkdirSync(dir, { recursive: true });
		for (const width of [375, 1280]) {
			const page = await browser.newPage({ viewport: { width, height: 812 }, reducedMotion: 'reduce' });
			for (const [type, name] of fixtures) {
				const where = `/catalogo/${type}/ › ${name} @${width}`;
				try {
					await page.goto(new URL(`/catalogo/${type}/`, baseUrl).href);
					assert.deepEqual(await settleDesignPage(page), []);
					const fixture = page.locator(`[data-fixture="${name}"]`);
					assert.equal(await fixture.count(), 1, 'fixture mancante');
					assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow orizzontale');
					if (type === 'hero') {
						const box = await fixture.locator('img').boundingBox();
						assert(box && Math.abs(box.width / box.height - 4 / 3) < 0.02, 'la foto orizzontale non resta 4:3');
						const original = await page.locator('[data-fixture="Split"] img').boundingBox();
						assert(original && Math.abs(original.width / original.height - (width < 1024 ? 4 / 3 : 4 / 5)) < 0.02, 'formato predefinito cambiato');
					} else if (type === 'services') {
						const media = await fixture.locator('li[data-surface] > :first-child').evaluateAll((nodes) => nodes.map((node) => {
							const box = node.getBoundingClientRect(); return { width: box.width, height: box.height };
						}));
						assert.equal(media.length, 3);
						assert(media.every((box) => Math.abs(box.width / box.height - 1.5) < 0.02), 'foto e icone occupano spazi diversi');
						assert.equal(await fixture.locator('li[data-surface] > div:first-child svg').count(), 2, 'icone di ripiego mancanti');
					} else if (type === 'gallery') {
						const caption = fixture.locator('li > p').first();
						assert(await caption.isVisible(), 'didascalia nascosta nella griglia');
						const opener = fixture.locator('[data-gallery-open]').first();
						await opener.focus(); await page.keyboard.press('Enter');
						await fixture.locator('dialog').waitFor({ state: 'visible' });
						assert.equal(await fixture.locator('[data-gallery-caption]').textContent(), await caption.textContent());
						await page.keyboard.press('Escape');
						assert(await opener.evaluate((element) => element === document.activeElement), 'focus non restituito');
					} else if (type === 'form') {
						assert(await fixture.getByText('Il tuo progetto inizia qui', { exact: true }).isVisible());
					} else {
						assert(await fixture.getByRole('link', { name: 'Parla con noi', exact: true }).isVisible());
						assert(await fixture.getByRole('link', { name: /^Mandaci le foto/ }).isVisible());
					}
					await fixture.screenshot({ path: join(dir, `${type}-${width}.jpg`), type: 'jpeg', quality: 80, animations: 'disabled', style: '[data-catalog-bar] { visibility: hidden; }' });
				} catch (cause) { error({ where, message: (cause as Error).message }); }
			}
			await page.close();
		}
	} finally { await browser.close(); }
	return findings;
}
