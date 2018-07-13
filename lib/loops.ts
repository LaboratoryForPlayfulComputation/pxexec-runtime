import _pxexec from './core-exec';

namespace loops {
	export function pause(ms: number) {
		let waitTil = new Date(new Date().getTime() + ms);

		while (new Date() < waitTil) {
			// This is a spinlock, and it blocks the entire application
		}
	}

	export function forever(h: () => void) {
		_pxexec.add_forever(h);
	}
}

export default loops;