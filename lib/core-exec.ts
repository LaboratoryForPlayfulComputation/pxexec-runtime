namespace _pxexec {
	interface EventDescription {
		predicate: () => boolean,
		handler: () => void
	}

	var forever_functions: Array<() => void>;

	var events: { [k: string]: EventDescription };

	export function init() {
		forever_functions = [];
		events = {};
	}

	export function add_forever(func: () => void) {
		forever_functions.push(func);
	}

	export function register_event(eventId: string, event: EventDescription) {
		events[eventId] = event;
	}

	export function run() {
		while (true) {
			for (let i = 0; i < forever_functions.length; i++) {
				forever_functions[i]();
			}
			for (let key in events) {
				const ev = events[key];
				if (ev.predicate()) {
					ev.handler();
				}
			}
		}
	}
}

export default _pxexec;
