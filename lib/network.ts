import { ChildProcess, spawn } from 'child_process';
import { Socket, createSocket } from 'dgram';
import { EventEmitter } from 'events';

import * as readline from 'readline';

import * as uuidv4 from 'uuid/v4';

namespace network {

	const PYTHON: string = "/usr/bin/python3"

	const RESPONSE_CALLBACKS: { [k: number]: (...args: any[]) => void | undefined } = {};

	const _eventDispatcher: EventEmitter = new EventEmitter();

	namespace signaling {
		const _UDP_SIGNALING_PORT = 38714;
		const _UDP_BROADCAST_ADDR = "255.255.255.255";
		interface UDPSignalingOffer {
			sourceid: string,
			targetid: string,
			encodedSDP: string,
		}

		let _socket: Socket | undefined = undefined;

		export function enableUDPSignaling(): void {
			_socket = createSocket('udp4');

			_socket.bind(_UDP_SIGNALING_PORT, function () {
				_socket.setBroadcast(true);
			})

			_socket.on("message", (msg, rinfo) => {
				console.log(`dgram in: "${msg.toString()}" from ${rinfo.address}:${rinfo.port}`)
			})
		}

		export function broadcastOffer(other: string, sdp: string | Buffer) {
			const msg: UDPSignalingOffer = {
				sourceid: _id,
				targetid: other,
				encodedSDP: sdp.toString()
			};
			_socket.send(JSON.stringify(msg), _UDP_SIGNALING_PORT, _UDP_BROADCAST_ADDR, (err, bytes) => {
				console.log(`callback from send: ${err}, ${bytes}`);
			});
		}
	}

	/**
	 * The base format of all messages FROM Python to this handler.
	 */
	interface RPCMarshallingFormat {
		type: "event" | "response",
		value: RPCResponse | RPCEvent,
	}

	/**
	 * The format of a Reponse sub-message, indicating a return value from
	 * a function call.
	 */
	interface RPCResponse {
		id: number,
		rpcEndpoint: string,
		value: any,
	}

	/**
	 * The format of an Event sub-message, indicating an event that was raised
	 * asynchronously in the Python daemon.
	 */
	interface RPCEvent {
		name: string,
		data: any
	}

	/**
	 * The format of an RPC invocation from this handler TO the remote daemon.
	 */
	interface PythonRPCCall {
		id: number,
		rpcEndpoint: string,
		args?: any[],
		kwArgs?: { [k: string]: any },
	}

	var _DAEMON_CHILD: ChildProcess | undefined = undefined;

	var _id: string | undefined = undefined;

	/**
	 * Interpret and dispatch data returned to this handler by the underlying
	 * Python daemon.
	 * @param dataBuf the string to interpret
	 */
	function _unMarshalRPCData(dataBuf: string | Buffer) {
		const dataStr = dataBuf.toString();
		console.log(dataStr);
		const data: RPCMarshallingFormat = <RPCMarshallingFormat>JSON.parse(dataBuf.toString());
		const type = data.type;
		switch (type) {
			case "event":
				const event = <RPCEvent>data.value;
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

	/**
	 * Initialize the network. This function creates a python daemon to handle
	 * RTC remotely. We call that daemon using an stdio-based RPC mechanism that
	 * uses JSON as a marshalling format.
	 * 
	 * @param peerid optionally, the universally unique identifier of your connection
	 */
	export function initialize(peerid: string) {
		_id = peerid;
		_DAEMON_CHILD = spawn(PYTHON, ['-u', '-m', 'node-aiortc-daemon']);
		_DAEMON_CHILD.stdout.on('data', _unMarshalRPCData);
		_DAEMON_CHILD.stderr.on('data', (data) => {
			console.log(`python console: ${data}`);
		});
		_DAEMON_CHILD.on('close', (code) => {
			console.log(`RTC daemon closed with status ${code} `);
		});
		console.log(`RTC Daemon created and initialized: ${_DAEMON_CHILD} `);

		signaling.enableUDPSignaling();
	}

	/**
	 * Return the configured Peer ID.
	 */
	export function getId(): string {
		return _id;
	}

	export function offer_to(otherpeer: string) {
		offer((sdp) => {
			console.log(sdp);
			signaling.broadcastOffer(otherpeer, sdp);
		})
	}

	function offer(cb?: (s: string) => void): void {
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

	/**
	 * 
	 * @param endpoint the name of the remote function to call
	 * @param cb a callback to invoke when the function returns, with the return
	 * value passed as an argument
	 * @param args optional set of arguments to use on the remote end (must match the arity and type constraints given
	 * in the remote program)
	 * @param kwArgs optional dictionary of kwArgs, passed as keyword arguments on the remote end
	 */
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