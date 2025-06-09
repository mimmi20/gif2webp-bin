import binBuild from '@localnerve/bin-build';
import bin from './index.js';

try {
	await bin.run(['-help']);
	console.log('gif2webp pre-build test passed successfully');
} catch (error) {
	console.warn(error.message);
	console.warn('gif2webp pre-build test failed');
	console.info('compiling from source');

	try {
		await binBuild.url('http://downloads.webmproject.org/releases/webp/libwebp-1.5.0.tar.gz', [
			`mkdir -p ${bin.dest()}`,
			`make -f makefile.unix examples/gif2webp && mv ./examples/gif2webp ${bin.path()}`,
		]);
		console.log('gif2webp built successfully');
	} catch {
		console.error(error.stack);
		throw error;
	}
}
