import _pxexec from './core-exec';

namespace loops {
	// Oh my god
	export function pause(ms : number) {
		let waitTil = new Date(new Date().getTime() + ms);

		while (new Date() < waitTil) {
			// This is a spinlock, and it blocks the entire application
		}
	}

	export function forever(h : () => void) {
		// There needs to be a lot of stuff here that has to do with state,
		// but I'm ignoring it for POC now.
		_pxexec.add_forever(() => {
			h();
		})
	}
}

export default loops;