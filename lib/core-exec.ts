export interface IEventDescription {
	predicate: () => boolean,
	handler: () => void
}

let foreverFunctions: Array<() => void>;

let events: { [k: string]: IEventDescription };

export function init() {
	foreverFunctions = [];
	events = {};
}

export function add_forever(func: () => void) {
	foreverFunctions.push(func);
}

export function register_event(eventId: string, event: IEventDescription) {
	events[eventId] = event;
}

export function run() {
	while (true) {
		for (const f of foreverFunctions) {
			f();
		}
		for (const key in events) {
			if (events.hasOwnProperty(key)) {
				const ev = events[key];
				if (ev.predicate()) {
					ev.handler();
				}
			}
		}
	}
}

