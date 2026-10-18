import type { Browser, Locator } from 'playwright';
import { type Finding } from './lib/report.ts';

/** Prove dei moduli su richieste intercettate: nessuna email o dato spedito a servizi esterni. */
export async function testForms(browser: Browser, baseUrl: string, path: string): Promise<Finding[]> {
	const findings: Finding[] = [];
	const expect = (ok: boolean, message: string) => {
		if (!ok) findings.push({ check: 'interactive', level: 'error', where: `${path} › form`, message });
	};
	const fill = async (form: Locator) => {
		await form.locator('[name="name"]').fill('Persona Esempio');
		await form.locator('[name="email"]').fill('persona@example.net');
		await form.locator('[name="message"]').fill('Vorrei informazioni su un progetto.');
		if (await form.locator('[name="service"]').count()) {
			await form.locator('[name="service"]').selectOption({ index: 1 });
			await form.locator('[name="city"]').fill('Comune Esempio');
		}
	};
	for (const width of [375, 1280]) {
		const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
		const page = await context.newPage();
		try {
			await page.goto(new URL(path, baseUrl).href);
			const form = page.locator('[data-contact-form]').first();
			const submit = form.locator('[type="submit"]');
			const status = form.locator('[data-form-status]');
			const demo = await form.getAttribute('data-demo') === 'true';
			let calls = 0;
			await page.route('**/api/contact', async (route) => { calls++; await route.fulfill({ json: { ok: true } }); });
			await submit.focus();
			await page.keyboard.press('Enter');
			expect(calls === 0, 'il modulo vuoto ha inviato una richiesta');
			expect(await form.locator('[name="name"]').evaluate((element) => element === document.activeElement), 'la validazione nativa non porta il focus al primo campo mancante');
			await fill(form);
			await form.locator('[name="privacy"]').focus();
			await page.keyboard.press('Space');
			await submit.focus();
			await page.keyboard.press('Enter');
			await status.filter({ hasText: demo ? 'nessuna email' : 'è stata inviata' }).waitFor();
			expect(calls === (demo ? 0 : 1), 'il modulo dimostrativo ha contattato il server o il modulo reale non ha inviato');
			expect(await status.evaluate((element) => element === document.activeElement), 'l’esito non riceve il focus');
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `scroll orizzontale a ${width}px`);
			const forms = page.locator('[data-contact-form]');
			if (await forms.count() > 1) expect(await forms.nth(1).locator('[name="name"]').inputValue() === '', 'la compilazione modifica un’altra istanza');
			// Le fixture successive coprono preventivo e tono primary, se presenti.
			for (let index = 1; index < await forms.count(); index++) {
				const other = forms.nth(index);
				await fill(other);
				await other.locator('[name="privacy"]').check();
				await other.locator('[type="submit"]').click();
				await other.locator('[data-form-status]').filter({ hasText: await other.getAttribute('data-demo') === 'true' ? 'nessuna email' : 'è stata inviata' }).waitFor();
			}
		} finally { await context.close(); }
	}
	// Sulla copia della pagina togliamo soltanto la modalità demo: proviamo lo script reale
	// con un endpoint intercettato, lasciando invariati il componente e il sito.
	const context = await browser.newContext();
	const page = await context.newPage();
	try {
		await page.route(new URL(path, baseUrl).href, async (route) => {
			const original = await route.fetch();
			await route.fulfill({ response: original, body: (await original.text()).replaceAll('data-demo="true"', '') });
		});
		let calls = 0;
		let success = false;
		let duplicate = false;
		await page.route('**/api/contact', async (route) => {
			calls++;
			if (duplicate) {
				await page.locator('[data-contact-form]').first().evaluate((element) => element.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
			}
			await route.fulfill({ status: success ? 200 : 502, json: { ok: success } });
		});
		await page.goto(new URL(path, baseUrl).href);
		const form = page.locator('[data-contact-form]').first();
		const button = form.locator('[type="submit"]');
		// Il markup della fixture nasce con il pulsante disabilitato per il fallback senza JS.
		await button.evaluate((element) => { (element as HTMLButtonElement).disabled = false; });
		await fill(form);
		await form.locator('[name="privacy"]').check();
		await button.click();
		await page.waitForFunction(() => document.querySelector('[data-form-status]')?.textContent?.includes('Non è stato possibile'));
		expect(await form.locator('[name="message"]').inputValue() === 'Vorrei informazioni su un progetto.', 'un errore cancella i dati');
		expect(await button.isEnabled(), 'dopo un errore non si può riprovare');
		success = true;
		duplicate = true;
		await button.click();
		await page.waitForFunction(() => document.querySelector('[data-form-status]')?.textContent?.includes('è stata inviata'));
		expect(calls === 2, 'l’invio in corso non blocca una seconda richiesta');
		expect(await form.locator('[name="message"]').inputValue() === '', 'dopo il successo i dati non sono cancellati');
		expect(await button.isEnabled(), 'dopo il successo il pulsante resta disabilitato');
	} finally { await context.close(); }
	const native = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await native.newPage();
		await page.goto(new URL(path, baseUrl).href);
		const form = page.locator('[data-contact-form]').first();
		expect(await form.getAttribute('method') === 'post' && await form.getAttribute('action') === '/api/contact', 'manca il POST nativo senza JavaScript');
		expect(await form.locator('[name="privacy"]').getAttribute('required') !== null, 'senza JS la privacy non è obbligatoria');
		expect(await form.locator('[type="submit"]').isDisabled() === (await form.getAttribute('data-demo') === 'true'), 'lo stato del pulsante senza JS non corrisponde alla modalità demo o sito');
	} finally { await native.close(); }
	return findings;
}
