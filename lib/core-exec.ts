namespace _pxexec {
	export interface EventDescription {
		predicate: () => boolean,
		handler: () => void
	}

	var forever_functions: Array<() => Promise<void>>;

	var events: { [k: string]: EventDescription };

	export function init() {
		forever_functions = [];
		events = {};
	}

	export function add_forever(func: () => Promise<void>) {
		forever_functions.push(func);
	}

	export function register_event(eventId: string, event: EventDescription) {
		events[eventId] = event;
	}

	export function run() {
		async function loop(): Promise<void> {
			for (let f of forever_functions) {
				await f();
			}
			// This eventually blows the max call size. I hit it almost instantly
			// if no forever function is registered.
			return loop();
		}

		loop();
	}
}

export default _pxexec;
