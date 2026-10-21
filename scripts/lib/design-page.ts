import type { Page } from 'playwright';

/** Attende le risorse effettive: il segnaposto senza src del popup non è una foto da caricare. */
export async function settleDesignPage(page: Page, timeout = 15_000): Promise<string[]> {
	return page.evaluate(async (timeout) => {
		const images = [...document.images].filter((image) =>
			image.currentSrc || image.getAttribute('src')?.trim() || image.getAttribute('srcset')?.trim()
			|| (image.parentElement?.tagName === 'PICTURE' && image.parentElement.querySelector('source[srcset]')),
		);
		const pending = new Set(images);
		const failed = new Set<HTMLImageElement>();
		const cleanup: (() => void)[] = [];
		let fontsReady = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const loaded = Promise.all(images.map((image) => new Promise<void>((resolve) => {
			let decoding = false;
			const done = () => {
				if (decoding) return;
				decoding = true;
				// load/naturalWidth non bastano: fuori schermo la bitmap può non essere ancora pronta.
				const decoded = image.naturalWidth > 0 ? image.decode() : Promise.resolve();
				void decoded.catch(() => { failed.add(image); }).finally(() => { pending.delete(image); resolve(); });
			};
			image.addEventListener('load', done, { once: true });
			image.addEventListener('error', done, { once: true });
			cleanup.push(() => { image.removeEventListener('load', done); image.removeEventListener('error', done); });
			image.loading = 'eager';
			if (image.complete) done(); // anche una risorsa già fallita non emetterà altri eventi
		}))).then(() => document.fonts.ready).then(() => { fontsReady = true; });
		try {
			await Promise.race([loaded, new Promise<void>((resolve) => { timer = setTimeout(resolve, timeout); })]);
		} finally {
			clearTimeout(timer);
			for (const remove of cleanup) remove();
		}
		const problems = images.filter((image) => {
			const box = image.getBoundingClientRect();
			return box.width > 0 && box.height > 0 && (pending.has(image) || failed.has(image) || image.naturalWidth === 0);
		}).map((image) => `immagine non caricata: ${image.getAttribute('src') || image.getAttribute('srcset') || image.currentSrc}`);
		if (!fontsReady && document.fonts.status !== 'loaded') problems.push('font non caricati entro il tempo limite');
		return problems;
	}, timeout);
}
