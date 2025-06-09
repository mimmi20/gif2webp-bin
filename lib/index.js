import {readFileSync} from 'node:fs';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import BinWrapper from '@xhmikosr/bin-wrapper';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const url = `https://raw.github.com/imagemin/gif2webp-bin/v${pkg.version}/vendor/`;

const binWrapper = new BinWrapper()
	.src(`${url}macos/gif2webp`, 'darwin')
	.src(`${url}linux/x86/gif2webp`, 'linux', 'x86')
	.src(`${url}linux/x64/gif2webp`, 'linux', 'x64')
	.src(`${url}win/x64/gif2webp.exe`, 'win32', 'x64')
	.dest(fileURLToPath(new URL('../vendor', import.meta.url)))
	.use(process.platform === 'win32' ? 'gif2webp.exe' : 'gif2webp');

export default binWrapper;
