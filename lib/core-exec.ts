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
		for (let func of forever_functions) {
			const this_loop = async (): Promise<void> => {
				await func();
				return this_loop();
			}
			this_loop();
		}
	}
}

export default _pxexec;
