import * as _pxexec from './core-exec';

export function pause(ms: number) {
	const waitTil = new Date(new Date().getTime() + ms);

	while (new Date() < waitTil) {
		// This is a spinlock, and it blocks the entire application
	}
}

export function forever(h: () => void) {
	_pxexec.add_forever(h);
}
