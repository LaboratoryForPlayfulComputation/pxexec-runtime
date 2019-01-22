import Fiber = require("fibers");
import Future = require("fibers/future");


export function pause(ms: number) {
	const fiber = Fiber.current;
	setTimeout(() => {
		fiber.run();
	}, ms);
	Fiber.yield();
}

export function forever(h: () => void) {
	const eternal = (f: () => void) => {
		while (true) {
			f();
		}
	}
	(Future as any).task(() => {
		eternal(h);
	}).detach();
}
