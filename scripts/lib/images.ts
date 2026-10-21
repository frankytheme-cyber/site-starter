import { existsSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import sharp from 'sharp';

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']);

/** Inventario ricorsivo: solo file regolari, senza fixture della libreria né symlink. */
export function imageInventory(root: string): string[] {
	if (!existsSync(root)) return [];
	const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = join(dir, entry.name);
		if (dir === root && entry.name === 'fixtures') return [];
		if (entry.isDirectory()) return walk(file);
		return entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? [file] : [];
	});
	return walk(root).sort();
}

/** Scrive sullo stesso filesystem, poi sostituisce: anche source === target è sicuro. */
export async function prepareImage(source: string, target: string, format: 'png' | 'webp' | 'jpeg') {
	const temporary = mkdtempSync(join(dirname(target), '.image-'));
	const output = join(temporary, 'prepared');
	try {
		// rotate() applica l'EXIF; senza withMetadata() non si copiano EXIF e GPS.
		const image = sharp(source).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true });
		if (format === 'png') await image.png({ compressionLevel: 9 }).toFile(output);
		else if (format === 'webp') await image.webp({ quality: 85 }).toFile(output);
		else await image.jpeg({ quality: 85, mozjpeg: true }).toFile(output);
		renameSync(output, target);
	} finally {
		rmSync(temporary, { recursive: true, force: true });
	}
}
