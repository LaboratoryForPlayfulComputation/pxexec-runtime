import _pxexec from './core-exec';

namespace loops {
	export async function pause(ms: number) {
		let waitTil = new Date(new Date().getTime() + ms);

		while (new Date() < waitTil) {
			// This is a spinlock, and it blocks the entire application
		}
	}

	export function _pause(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	export function forever(h: () => Promise<void>) {
		_pxexec.add_forever(h);
	}
}

export default loops;