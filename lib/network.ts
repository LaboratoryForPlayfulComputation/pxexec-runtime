import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

namespace network {

	const PYTHON: string = "/usr/bin/python3"

	const RESPONSE_CALLBACKS: { [k: number]: (...args: any[]) => void | undefined } = {};

	const _eventDispatcher: EventEmitter = new EventEmitter();

	interface RPCMarshallingFormat {
		type: "event" | "response",
		value: RPCResponse | RPCEvent,
	}

	interface RPCResponse {
		id: number,
		rpcEndpoint: string,
		value: any,
	}

	interface RPCEvent {
		name: string,
		data: any
	}

	interface PythonRPCCall {
		id: number,
		rpcEndpoint: string,
		args?: any[],
		kwArgs?: { [k: string]: any },
	}

	var _DAEMON_CHILD: ChildProcess | undefined = undefined;

	function _unMarshalRPCData(dataBuf: string | Buffer) {
		const data: RPCMarshallingFormat = <RPCMarshallingFormat>JSON.parse(dataBuf.toString());
		const type = data.type;
		switch (type) {
			case "event":
				const event = <RPCEvent>data.value;
				console.log(`got an event: ${event}`);
				_eventDispatcher.emit(event.name, event.data)
				break;
			case "response":
				const response = <RPCResponse>data.value;
				const cb = RESPONSE_CALLBACKS[response.id];
				if (cb != undefined) {
					delete RESPONSE_CALLBACKS[response.id];
					cb(response.value);
				}
				break;
		}
	}

	export function initialize() {
		_DAEMON_CHILD = spawn(PYTHON, ['-u', '-m', 'node-aiortc-daemon']);
		_DAEMON_CHILD.stdout.on('data', _unMarshalRPCData);
		_DAEMON_CHILD.stderr.on('data', (data) => {
			console.log(`python console: ${data}`);
		});
		_DAEMON_CHILD.on('close', (code) => {
			console.log(`RTC daemon closed with status ${code} `);
		});
		console.log(`RTC Daemon created and initialized: ${_DAEMON_CHILD} `);
	}

	export function foo(cb?: (n: number) => void): void {
		_send_call("foo", cb);
	}

	export function offer(cb?: (s: string) => void): void {
		_send_call("get_local_offer_sdp", cb);
	}

	export function answer(offer: string, cb?: (s: string) => void): void {
		_send_call("answer", cb, [offer]);
	}

	export function complete_offer(answer: string, cb?: (s: string) => void): void {
		_send_call("complete_offer", cb, [answer])
	}

	export function on_message(cb: (s: string) => void): void {
		_eventDispatcher.addListener("channel_message", cb);
	}

	function _send_call(
		endpoint: string,
		cb?: (...args: any[]) => void,
		args?: any[],
		kwArgs?: { [k: string]: any }
	): void {
		var id = Math.ceil(Math.random() * 2000000000);
		while (RESPONSE_CALLBACKS[id] != undefined) {
			id = Math.ceil(Math.random() * 2000000000);
		}
		const spec: PythonRPCCall = {
			id: id,
			rpcEndpoint: endpoint,
			args: args,
			kwArgs: kwArgs
		};
		if (cb != undefined) {
			RESPONSE_CALLBACKS[id] = cb;
		}
		_DAEMON_CHILD.stdin.write(JSON.stringify(spec) + '\n');
	}
}

export default network;