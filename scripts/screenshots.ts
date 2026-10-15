/**
 * Screenshot del catalogo in docs/catalogo/img/: build, astro preview e Playwright (Chromium).
 * - per ogni blocco × variante, la pagina /catalogo/<tipo>/<variante>/ a 1280 e 375 px:
 *   <tipo>--<variante>--desktop.webp e <tipo>--<variante>--mobile.webp;
 * - per l'hero, uno scatto desktop della prima variante con ogni palette:
 *   hero--palette-<palette>--desktop.webp.
 * Prima di ogni scatto si aspettano i font e tutte le immagini (anche quelle lazy); movimento ridotto.
 * Gli screenshot che non corrispondono più a una variante vengono tolti.
 *
 * Uso: npm run screenshots                  build compresa
 *      npm run screenshots -- --no-build     usa la dist/ che c'è
 *      npm run catalog                       gen:catalog + screenshots
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';
import sharp from 'sharp';
import { paletteScreenshotName, SCREEN_WIDTHS, screenshotName } from '../src/core/catalog.ts';
import { freePort, startPreview, stopPreview } from './checks/lib/preview.ts';
import { ROOT } from './checks/lib/project.ts';
import { CATALOG_DIR, generateCatalog } from './gen-catalog.ts';

const IMG_DIR = join(CATALOG_DIR, 'img');
const SIZES = [
	{ name: 'desktop', width: SCREEN_WIDTHS.desktop, height: 900 },
	{ name: 'mobile', width: SCREEN_WIDTHS.mobile, height: 800 },
] as const;
const IMAGE_TIMEOUT = 15_000;

const { variants, palettes, images, problems } = await generateCatalog();
if (problems.length > 0) {
	console.error('Schede del catalogo da sistemare prima degli screenshot:');
	for (const problem of problems) console.error(`  ✗ ${problem}`);
	process.exit(1);
}

if (!process.argv.includes('--no-build')) {
	const build = spawnSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
	if (build.status !== 0) process.exit(build.status ?? 1);
}

/** Immagini caricate (le lazy diventano eager) e font pronti, con un tetto di attesa. */
async function settle(page: Page) {
	await page.evaluate(async (timeout) => {
		const images = [...document.images];
		for (const image of images) image.loading = 'eager';
		const loaded = Promise.all(
			images.map((image) =>
				image.complete && image.naturalWidth > 0
					? image.decode().catch(() => {})
					: new Promise((resolve) => {
							image.addEventListener('load', resolve, { once: true });
							image.addEventListener('error', resolve, { once: true });
						}),
			),
		);
		await Promise.race([loaded, new Promise((resolve) => setTimeout(resolve, timeout))]);
		await document.fonts.ready;
	}, IMAGE_TIMEOUT);
	// Un attimo per gli script dei blocchi interattivi (frecce del carosello, schede).
	await page.waitForTimeout(200);
}

async function shoot(page: Page, path: string, file: string) {
	await page.goto(path, { waitUntil: 'load' });
	await settle(page);
	const png = await page.locator('main').screenshot({ type: 'png', animations: 'disabled' });
	await sharp(png).webp({ quality: 82 }).toFile(join(IMG_DIR, file));
	console.log(`  ${file}`);
}

const port = await freePort();
const preview = await startPreview(port);
const browser = await chromium.launch();
try {
	mkdirSync(IMG_DIR, { recursive: true });
	for (const size of SIZES) {
		const context = await browser.newContext({
			baseURL: `http://127.0.0.1:${port}`,
			viewport: { width: size.width, height: size.height },
			deviceScaleFactor: 1,
			reducedMotion: 'reduce',
		});
		const page = await context.newPage();
		console.log(`${size.name} (${size.width} px)`);
		for (const { type, variant } of variants) {
			await shoot(page, `/catalogo/${type}/${variant}/`, screenshotName(type, variant, size.name));
		}
		const hero = variants.find(({ type }) => type === 'hero');
		if (size.name === 'desktop' && hero) {
			for (const palette of palettes) {
				await shoot(page, `/catalogo/hero/${hero.variant}/?palette=${palette}`, paletteScreenshotName(palette));
			}
		}
		await context.close();
	}
	const stale = readdirSync(IMG_DIR).filter((file) => file.endsWith('.webp') && !images.includes(file));
	for (const file of stale) unlinkSync(join(IMG_DIR, file));
	console.log(`\n${images.length} screenshot in docs/catalogo/img${stale.length > 0 ? `; tolti ${stale.join(', ')}` : ''}.`);
} finally {
	await browser.close();
	stopPreview(preview);
}
