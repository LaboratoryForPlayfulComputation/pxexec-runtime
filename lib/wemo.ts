import Wemo = require('wemo-client');

import * as core from './core-exec';
import * as console from './console';

type ClientResolver = (value?: WemoClient | PromiseLike<WemoClient>) => void;

const CLIENTS: { [k: string]: WemoClient } = {};
const RESOLVER_QUEUE: { [k: string]: Array<ClientResolver> } = {};

// How many times to run discover() on launch.
const INIT_CYCLES = 3;
const DISCOVER_INTERVAL = 5000;

const BLOCK_TIMEOUT = 15000;

const wemo = new Wemo();

// WeMo discovery

function discover(cycles?: number) {
    wemo.discover((err, deviceInfo) => {
        if (err) {
            console.error(err);
        } else {
            console.debug(`Found wemo (\`${deviceInfo.friendlyName}\`): `, deviceInfo)

            const client = wemo.client(deviceInfo);
            const serial = deviceInfo.serialNumber;
            CLIENTS[serial] = client;

            // Resolve all promises that are blocked on this client
            if (RESOLVER_QUEUE[serial]) {
                RESOLVER_QUEUE[serial].forEach((resolve) => {
                    resolve(client);
                })
            }

            client.on('error', (err) => {
                console.debug(`Lost wemo (${deviceInfo.friendlyName}) from: `, err.code);
                if (CLIENTS[serial]) {
                    CLIENTS[serial]
                    delete CLIENTS[serial];
                } else {
                    console.warn(`Wemo (${deviceInfo.friendlyName}) loss was not previously connected.`)
                }
            });
        }
    });

    if (cycles) {
        setImmediate(() => {
            discover(cycles - 1);
        });
    } else {
        setTimeout(() => {
            discover();
        }, DISCOVER_INTERVAL);
    }
}

function requireClient(serial: string, timeout?: number): Promise<WemoClient> {
    return new Promise((resolve, reject) => {
        if (CLIENTS[serial]) {
            // Client already exists, immediately resolve
            resolve(CLIENTS[serial]);
        } else {
            // Client does not exist, configure a resolver and set a timeout
            let cancellationToken: NodeJS.Timeout | undefined = undefined;
            if (timeout) {
                cancellationToken = setTimeout(() => {
                    reject("timed out");
                }, timeout);
            }
            if (!(RESOLVER_QUEUE[serial])) {
                RESOLVER_QUEUE[serial] = [];
            }

            RESOLVER_QUEUE[serial].push((v) => {
                if (cancellationToken) {
                    clearTimeout(cancellationToken);
                }
                resolve(v);
            })
        }
    });
}

core.onInit(() => {
    discover(INIT_CYCLES);
})

export enum WemoSwitchState {
    OFF = "0",
    ON = "1"
}

export class WemoDevice {
    private serial: string;

    constructor(serial: string) {
        this.serial = serial;
    }

    setSwitchState(newState: WemoSwitchState) {
        core._await(requireClient(this.serial, BLOCK_TIMEOUT).then((client) => {
            return new Promise((resolve, reject) => {
                client.setBinaryState(newState, (err, _) => {
                    if (err) {
                        reject("setBinaryState failed: " + err)
                    } else {
                        resolve()
                    }
                })
            })
        }))
    }
}

export function onConnect(serial: string, cb: (client: WemoDevice) => void) {
    requireClient(serial).then((_) => {
        core._detach(() => {
            cb(new WemoDevice(serial));
        })
    })
}

export function bySerialNumber(serial: string): WemoDevice {
    return new WemoDevice(serial);
}
