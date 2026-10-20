/**
 * Foto del sito in src/assets/images (npm run images).
 *
 * Senza argomenti elenca le foto che ci sono (tranne quelle di prova in fixtures/): dimensioni,
 * orientamento e peso, per l'inventario prima di comporre le pagine.
 * Con file o cartelle le prepara e le copia lì: orientamento giusto, lato lungo al massimo 2400 px,
 * nessun metadato (EXIF, posizione GPS), nome in kebab-case senza accenti. JPEG, PNG e WebP restano
 * nel loro formato, TIFF e AVIF diventano JPEG. Un file con lo stesso nome non si sovrascrive senza
 * --sovrascrivi.
 *
 * Uso: npm run images                                   elenco delle foto del sito
 *      npm run images -- ~/Downloads/foto/ logo.png      prepara e copia
 *      npm run images -- foto.jpg --sovrascrivi           sostituisce un file con lo stesso nome
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { rel, ROOT } from './checks/lib/project.ts';

const DIR = join(ROOT, 'src/assets/images');
const MAX_SIDE = 2400;
/** Sotto questa misura del lato lungo una foto va bene per card e miniature, non per una hero. */
const SMALL = 1200;
const INPUT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']);

const args = process.argv.slice(2);
const overwrite = args.includes('--sovrascrivi');
const paths = args.filter((arg) => !arg.startsWith('--'));
const unknown = args.filter((arg) => arg.startsWith('--') && arg !== '--sovrascrivi');
if (unknown.length > 0) {
	console.error(`✗ argomento sconosciuto: ${unknown.join(', ')}\n  uso: npm run images [-- <file o cartella>... [--sovrascrivi]]`);
	process.exit(1);
}

const kebab = (name: string) =>
	name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'foto';

const orientation = (width: number, height: number) =>
	Math.abs(width - height) / Math.max(width, height) < 0.1 ? 'quadrata' : width > height ? 'orizzontale' : 'verticale';

async function describe(file: string) {
	const { width = 0, height = 0 } = await sharp(file).metadata();
	const kb = Math.round(statSync(file).size / 1024);
	const small = Math.max(width, height) < SMALL ? '  ! piccola: per card e miniature, non per una hero' : '';
	return `${rel(file)}  ${width}×${height}  ${orientation(width, height)}  ${kb} KB${small}`;
}

/** File immagine dentro i percorsi indicati (le cartelle senza sottocartelle). */
function inputs(): string[] {
	return paths.flatMap((path) => {
		const full = resolve(path);
		if (!existsSync(full)) {
			console.error(`✗ ${path}: non esiste`);
			process.exitCode = 1;
			return [];
		}
		const files = statSync(full).isDirectory() ? readdirSync(full).map((name) => join(full, name)) : [full];
		return files.filter((file) => INPUT.has(extname(file).toLowerCase()) && statSync(file).isFile());
	});
}

if (paths.length === 0) {
	const files = existsSync(DIR)
		? readdirSync(DIR)
				.filter((name) => INPUT.has(extname(name).toLowerCase()))
				.sort()
				.map((name) => join(DIR, name))
		: [];
	if (files.length === 0) console.log('Nessuna foto in src/assets/images (le foto di prova di fixtures/ non contano).');
	for (const file of files) console.log(await describe(file));
	process.exit(0);
}

mkdirSync(DIR, { recursive: true });
let done = 0;
for (const source of inputs()) {
	const extension = extname(source).toLowerCase();
	const format = extension === '.png' ? 'png' : extension === '.webp' ? 'webp' : 'jpeg';
	const target = join(DIR, `${kebab(basename(source, extname(source)))}.${format === 'jpeg' ? 'jpg' : format}`);
	if (existsSync(target) && !overwrite) {
		console.error(`! ${rel(target)} c'è già: saltata ${source} (--sovrascrivi per sostituirla)`);
		continue;
	}
	try {
		// rotate() raddrizza la foto secondo l'EXIF; senza withMetadata() i metadati non vengono copiati.
		const image = sharp(source).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true });
		if (format === 'png') await image.png({ compressionLevel: 9 }).toFile(target);
		else if (format === 'webp') await image.webp({ quality: 85 }).toFile(target);
		else await image.jpeg({ quality: 85, mozjpeg: true }).toFile(target);
		console.log(`✓ ${await describe(target)}`);
		done++;
	} catch (cause) {
		console.error(`✗ ${source}: ${(cause as Error).message}`);
		process.exitCode = 1;
	}
}
console.log(`\n${done} foto in src/assets/images. Nelle ricette: "../../assets/images/<file>", con un alt che dice cosa mostra.`);
