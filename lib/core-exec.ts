import Fiber = require("fibers");

export const env = process.env;

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
