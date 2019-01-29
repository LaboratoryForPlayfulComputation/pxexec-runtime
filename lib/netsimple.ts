import { SignalingClient } from 'dss-client';
import { URL } from 'url';
import uuidv4 = require('uuid/v4');

import { _await, _detach, env, hacks } from './core-exec';

import { log } from './console';

let client: SignalingClient;

const COMM_NAME = 'comms';

const connections: { [k: string] : RTCDataChannel } = {};

const onConnectEvents: { [k: string] : Array<() => void> } = {}

const onMessageEvents: Array<(p: string, m: string) => void> = [];

const onMessageFromEvents: { [k: string]: Array<(m: string) => void> } = {};

let initialized = false;

function wireConnEvents(channel: RTCDataChannel, otherID: string): void {
    channel.onmessage = (msg) => {
        onMessageEvents.forEach((handler) => {
            _detach(() => handler(otherID, msg.data));
        });
        const fromHandlers = onMessageFromEvents[otherID];
        if (fromHandlers) {
            onMessageFromEvents[otherID].forEach((handler) => {
                _detach(() => handler(msg.data));
            });
        }
    };
    const onConnectHandlers = onConnectEvents[otherID];
    if (onConnectHandlers) {
        onConnectEvents[otherID].forEach((handler) => {
            _detach(() => handler());
        });
    }
}

// Really just have to mask this function...
export function initialize() {
    return;
}

export function start() {
    _join();
}

export function joinAs(id: string) {
    _join(id);
}

function _join(id?: string) {
    if (!initialized) {
        initialized = true;
        const gqlURL = new URL(env.GRAPHQL_URL);
        client = new SignalingClient({
            endpoint: gqlURL.pathname,
            host: gqlURL.hostname,
            id: id || uuidv4(),
            port: parseInt(gqlURL.port, 10),
            secure: gqlURL.protocol === "https",
            webRTCImplementation: hacks.wrtc,
            webRTCOptions: {
                peerOptions: {}
            }
        });
        client.on('CONN_OPEN', (args) => {
            const channel: RTCDataChannel = args[1];
            const otherID = args[2]
            log("Connection opened with: " + otherID);
            connections[otherID] = channel;
            wireConnEvents(channel, otherID);
        });
        client.start();
    }
}

export function getId() {
    return client.id;
}

export function waitForConnection(peer: string): void {
    _await(client.openDataChannel(COMM_NAME, peer));
}

export function sendString(message: string, peer: string) {
    const channel = connections[peer];
    if (channel) {
        channel.send(message);
    }
}

function _registerKeyedHandler(registry: {[k: string] : any}, key: string, handler: any) {
    let handlers = registry[key];
    if (!handlers) {
        handlers = [];
        registry[key] = handlers;
    }
    handlers.push(handler);
}

export function onConnectTo(peer: string, handler: () => void): void {
    _registerKeyedHandler(onConnectEvents, peer, handler);
}

export function onReceiveString(handler: (peer: string, message: string) => void): void {
    onMessageEvents.push(handler);
}

export function onReceiveStringFrom(peer: string, handler: (message: string) => void): void {
    _registerKeyedHandler(onMessageFromEvents, peer, handler);
}