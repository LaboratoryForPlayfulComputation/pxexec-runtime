import Fiber = require('fibers');
import Future = require('fibers/future');

export const env = process.env;

/**
 * On Start
 */
export function main(body: () => void) {
	Fiber(body).run();
}

export function _detach(body: () => void) {
	(Future as any).task(body).detach();
}

export function _await<T>(task: Promise<T>): T {
	const fiber = Fiber.current;
	let r: T;
	task.then((val: T) => {
		r = val;
		fiber.run();
	});
	Fiber.yield();
	return r;
}
