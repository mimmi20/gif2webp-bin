import binBuild from '@localnerve/bin-build';
import bin from './index.js';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {symlink, mkdir} from 'node:fs/promises';
import binVersionCheck from 'bin-version-check';
import which from 'which';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const install = async () => {
	try {
		await bin.run(['-help']);
		console.log('gif2webp pre-build test passed successfully');
	} catch (error) {
		console.warn(error.message);
		console.warn('gif2webp pre-build test failed');
		console.info('compiling from source');
		console.info(bin.dest());

		try {
			await binBuild.url('https://downloads.webmproject.org/releases/webp/libwebp-1.5.0.tar.gz', [
				`mkdir -p ${bin.dest()}`,
				`make -f makefile.unix examples/gif2webp && mv ./examples/gif2webp ${bin.dest()}`,
			]);
			console.log('gif2webp built successfully');
		} catch {
			console.error(error.stack);
			throw error;
		}
	}
};

(async () => {
	try {
		const use = process.platform === 'win32' ? 'gif2webp.exe' : 'gif2webp';
		const systemBin = await which(use).catch(error => {
			throw error;
		});
		const version = '>=1.5.0';
		await binVersionCheck(systemBin, version, {args: ['-version']}).catch(error => {
			console.warn(`The \`${systemBin}\` binary doesn't seem to work correctly or doesn't satisfy version \`${version}\``);
			throw error;
		});
		const vendor = path.join(__dirname, '../vendor');
		await mkdir(vendor).catch(error => {
			if (error.code === 'EEXIST') {
				return;
			}

			console.warn(error.message);
			throw error;
		});
		const target = path.join(vendor, use);
		await symlink(systemBin, target).catch(error => {
			if (error.code === 'EEXIST') {
				return;
			}

			console.warn(error.message);
			throw error;
		});
		console.log(`create gif2webp symlink \`${target}\``);
	} catch {
		await install().catch(() => {
			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(1);
		});
	}
})();
