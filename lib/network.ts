import { ChildProcess, spawn } from 'child_process';
import { Socket, createSocket } from 'dgram';
import { EventEmitter } from 'events';
import { AddressInfo } from 'net';

//import * as readline from 'readline';
//import * as uuidv4 from 'uuid/v4';

namespace network {

	const PYTHON: string = "/usr/bin/python3"

	const RESPONSE_CALLBACKS: { [k: number]: (...args: any[]) => void | undefined } = {};

	const RECEIVE_HANDLERS: { [k: string]: Array<(m: string) => Promise<void>> } = {};

	const _eventDispatcher: EventEmitter = new EventEmitter();

	namespace signaling {
		const _UDP_SIGNALING_PORT = 38714;
		const _UDP_BROADCAST_ADDR = "255.255.255.255";

		interface UDPSignalingMarshallingFormat {
			type: "offer" | "answer"
			value: UDPSignalingPayload
		}

		interface UDPSignalingPayload {
			from: string,
			to: string,
			escapedSDP: string,
		}

		let _socket: Socket | undefined = undefined;

		let _offer_handler: ((sdp: string, from: string) => void) | undefined = undefined;
		let _answer_handler: ((sdp: string, from: string) => void) | undefined = undefined;

		function _unMarshalUDPSignallingData(msg: Buffer, _rinfo: AddressInfo) {
			const data: UDPSignalingMarshallingFormat = <UDPSignalingMarshallingFormat>JSON.parse(msg.toString());
			const type = data.type;
			if (data.value.to == _id) {
				switch (type) {
					case "offer":
						_offer_handler(data.value.escapedSDP, data.value.from);
						break;
					case "answer":
						_answer_handler(data.value.escapedSDP, data.value.from);
						break;
				}
			}
		}

		export function enableUDPSignaling(
			on_offer: (sdp: string, from: string) => void,
			on_answer: (sdp: string, from: string) => void
		): void {
			_offer_handler = on_offer;
			_answer_handler = on_answer;
			_socket = createSocket('udp4');

			_socket.bind(_UDP_SIGNALING_PORT, function () {
				_socket.setBroadcast(true);
			})

			_socket.on('message', _unMarshalUDPSignallingData);
		}

		export function broadcast(type: "offer" | "answer", to: string, sdp: string | Buffer) {
			const msg: UDPSignalingMarshallingFormat = {
				type: type,
				value: <UDPSignalingPayload>{
					from: _id,
					to: to,
					escapedSDP: sdp.toString()
				}
			};

			_socket.send(JSON.stringify(msg), _UDP_SIGNALING_PORT, _UDP_BROADCAST_ADDR, (err, bytes) => {
				if (err != null && err != undefined) {
					console.log(`callback from send: ${err}, ${bytes.toString()}`);
				}
			});
		}
	}

	/**
	 * The base format of all messages FROM Python to this handler.
	 */
	interface RPCMarshallingFormat {
		type: "event" | "response" | "throw",
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
			case "throw":
				const throwData = <RPCResponse>data.value;
				delete RESPONSE_CALLBACKS[throwData.id];
				console.log(`error in aiortc daemon ${throwData.rpcEndpoint}: ${throwData.value}`)
		}
	}

	function _messageHandler(data: any) {
		const callbacks = RECEIVE_HANDLERS[data.peer];
		for (let cb of callbacks) {
			cb(data.message);
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
		_DAEMON_CHILD.on('error', (e) => {
			console.log(e);
		});
		_DAEMON_CHILD.stdout.on('data', _unMarshalRPCData);
		_DAEMON_CHILD.stderr.on('data', (data) => {
			console.log(`python console: ${data}`);
		});
		_DAEMON_CHILD.on('close', (code) => {
			console.log(`RTC daemon closed with status ${code} `);
		});

		_eventDispatcher.on('channel_message', _messageHandler);
		_eventDispatcher.on('message_sent', (data) => {
			console.log(`message sent: ${data}`);
		})

		_eventDispatcher.on('channel_open', (data) => {
			console.log(`Opened a channel with ${data.peer}`);
		});

		signaling.enableUDPSignaling(
			(offer: string, from: string) => {
				answer(offer, from, (answer) => { signaling.broadcast("answer", from, answer); });
			},
			(answer: string, from: string) => {
				complete_offer(answer, from)
			}
		);
	}

	export function connect(otherpeer: string) {
		offer(otherpeer, (sdp) => {
			signaling.broadcast("offer", otherpeer, sdp);
		})
	}

	function offer(peerid: string, cb?: (s: string) => void): void {
		_send_call("create_peer_connection", (_status: true) => {
			_send_call("offer", cb, [peerid]);
		}, [peerid])
	}

	function answer(offer: string, peerid: string, cb?: (s: string) => void): void {
		_send_call("create_peer_connection", (_status: true) => {
			_send_call("answer", cb, [offer, peerid]);
		}, [peerid])
	}

	function complete_offer(answer: string, peerid: string, cb?: (s: string) => void): void {
		_send_call("complete_offer", cb, [answer, peerid])
	}

	export function send(peerid: string, message: string) {
		_send_call("send", undefined, [message, peerid])
	}

	export function onReceive(_peer: string, cb: (msg: string) => Promise<void>): void {
		if (RECEIVE_HANDLERS[_peer] == undefined) {
			RECEIVE_HANDLERS[_peer] = [cb]
		} else {
			RECEIVE_HANDLERS[_peer].push(cb);
		}
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