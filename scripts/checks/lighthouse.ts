/**
 * lighthouse (suite qa): Lighthouse in modalità mobile sulle pagine del sito (non sul catalogo),
 * 3 esecuzioni per pagina, mediana di ogni valore. Soglie: performance 90, accessibilità 95,
 * best practices 95, SEO 100, CLS ≤ 0,05, LCP ≤ 2500 ms. Il report HTML dell'esecuzione mediana
 * va in reports/lighthouse/.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouseRun from 'lighthouse';
import { chromium } from 'playwright';
import { type CheckContext, collector } from './lib/report.ts';
import { builtPages } from './lib/project.ts';

const RUNS = 3;
const CATEGORIES = [
	{ id: 'performance', label: 'Performance', min: 90 },
	{ id: 'accessibility', label: 'Accessibilità', min: 95 },
	{ id: 'best-practices', label: 'Best practices', min: 95 },
	{ id: 'seo', label: 'SEO', min: 100 },
] as const;
const METRICS = [
	{ id: 'cumulative-layout-shift', label: 'CLS', max: 0.05, format: (value: number) => value.toFixed(3) },
	{ id: 'largest-contentful-paint', label: 'LCP', max: 2500, format: (value: number) => `${Math.round(value)} ms` },
] as const;

type RunnerResult = NonNullable<Awaited<ReturnType<typeof lighthouseRun>>>;

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

export async function lighthouse({ baseUrl, reportsDir }: CheckContext) {
	const { findings, error } = collector('lighthouse');
	if (!baseUrl) throw new Error('serve il server di anteprima');
	const pages = builtPages().filter((path) => !path.startsWith('/catalogo/'));
	const outDir = join(reportsDir, 'lighthouse');
	mkdirSync(outDir, { recursive: true });

	const chrome = await chromeLauncher.launch({
		chromePath: chromium.executablePath(),
		chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
	});
	try {
		for (const path of pages) {
			const url = new URL(path, baseUrl).href;
			const runs: RunnerResult[] = [];
			for (let i = 0; i < RUNS; i++) {
				const result = await lighthouseRun(url, {
					port: chrome.port,
					output: 'html',
					logLevel: 'error',
					onlyCategories: CATEGORIES.map((category) => category.id),
				});
				if (!result) throw new Error(`Lighthouse non ha prodotto risultati per ${path}`);
				runs.push(result);
			}
			const scores = (id: string) => runs.map((run) => Math.round((run.lhr.categories[id]?.score ?? 0) * 100));
			const values = (id: string) => runs.map((run) => run.lhr.audits[id]?.numericValue ?? Number.NaN);

			for (const category of CATEGORIES) {
				const all = scores(category.id);
				const value = median(all);
				if (value < category.min) {
					const failing = Object.values(runs[0].lhr.categories[category.id].auditRefs)
						.map((ref) => runs[0].lhr.audits[ref.id])
						.filter((audit) => audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative')
						.slice(0, 4)
						.map((audit) => audit.title);
					error({
						where: `${path} › ${category.label}`,
						message: `${value} (mediana di ${all.join(', ')}), soglia ${category.min}`,
						hint: failing.length > 0 ? `da guardare: ${failing.join('; ')}` : 'apri il report in reports/lighthouse/',
					});
				}
			}
			for (const metric of METRICS) {
				const all = values(metric.id);
				const value = median(all);
				if (!(value <= metric.max)) {
					error({
						where: `${path} › ${metric.label}`,
						message: `${metric.format(value)} (mediana di ${all.map(metric.format).join(', ')}), massimo ${metric.format(metric.max)}`,
						hint: 'apri il report in reports/lighthouse/ per vedere gli elementi coinvolti',
					});
				}
			}

			// Report HTML dell'esecuzione con la performance mediana.
			const performance = scores('performance');
			const index = performance.indexOf(median(performance));
			const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
			writeFileSync(join(outDir, `${name}.html`), String(runs[index].report));
		}
	} finally {
		chrome.kill();
	}
	return findings;
}
