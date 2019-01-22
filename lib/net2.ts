import { SignalingClient } from 'dss-client';
import { URL } from 'url';
import uuidv4 = require('uuid/v4');

import { _await, env } from './core-exec';

let client: SignalingClient;

const COMM_NAME = 'comms';

export class Channel {
    private handle: any;
    constructor(handle: any) {
        this.handle = handle;
    }

    public send(message: string) {
        this.handle.send(message);
    }
}

export function init(id?: string) {
    const gqlURL = new URL(env.GRAPHQL_URL);
    client = new SignalingClient({
        endpoint: gqlURL.pathname,
        host: gqlURL.hostname,
        id: id || uuidv4(),
        port: parseInt(gqlURL.port, 10),
        secure: gqlURL.protocol === "https",
        webRTCOptions: {
            peerOptions: {}
        }
    });
    client.start();
}

export function getId() {
    return client.id;
}

export function waitForConnection(peer: string): Channel {
    const dc = _await(client.openDataChannel(COMM_NAME, peer));
    return new Channel(dc);
}