import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa} from 'execa';
import {temporaryDirectory} from 'tempy';
import binCheck from '@lesjoursfr/bin-check';
import binBuild from '@localnerve/bin-build';
import compareSize from 'compare-size';
import {readChunk} from 'read-chunk';
import isWebp from 'is-webp';
import bin from '../index.js';

function getCurrentFilenames(dir) {
	console.log("\nCurrent filenames:");
	readdirSync(dir).forEach(file => {
		console.log(file);
	});
	console.log("\n");
}

test('rebuild the gif2webp binaries', async t => {
	// Skip the test on Windows
	if (process.platform === 'win32') {
		t.pass();
		return;
	}

	const temporary = temporaryDirectory();

	console.log('make - start');

	await binBuild.url('https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.5.0.tar.gz', [
		`mkdir -p ${temporary}`,
		`make -f makefile.unix examples/gif2webp && mv ./examples/gif2webp ${path.join(temporary, 'gif2webp')}`,
	]);

	console.log('make - end');

	t.true(existsSync(temporary));
	getCurrentFilenames(temporary);
	t.true(existsSync(path.join(temporary, 'gif2webp')));
});

test('return path to binary and verify that it is working', async t => {
	// Skip the test on Windows
	if (process.platform === 'win32') {
		t.pass();
		return;
	}

	t.true(await binCheck(bin, ['-help']));
});

test('convert a GIF to WebP', async t => {
	// Skip the test on Windows
	if (process.platform === 'win32') {
		t.pass();
		return;
	}

	const temporary = temporaryDirectory();
	const src = fileURLToPath(new URL('fixtures/test.gif', import.meta.url));
	const dest = path.join(temporary, 'test.webp');
	const args = [
		src,
		'-o',
		dest,
	];

	await execa(bin, args);
	const result = await compareSize(src, dest);

	t.true(result[dest] < result[src]);
	t.true(isWebp(await readChunk(dest, {
		length: 12,
		startPosition: 0,
	})));
});
