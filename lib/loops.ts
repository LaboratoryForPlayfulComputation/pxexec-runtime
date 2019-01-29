import { _await, _detach } from './core-exec';

export function pause(ms: number) {
	_await(new Promise((resolve, _) => {
		setTimeout(() => {
			resolve();
		}, ms);
	}));
}

export function forever(h: () => void) {
	const eternal = (f: () => void) => {
		while (true) {
			f();
		}
	}
	_detach(() => eternal(h));
}
