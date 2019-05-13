import Wemo = require('wemo-client');

import * as core from './core-exec';
import * as console from './console';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

type Client = StrictEventEmitter<WemoClient, WemoClientEvents>;
type ClientResolver = (value?: Client | PromiseLike<Client>) => void;
type ClientBinder = (serial: string) => void;

const CLIENTS: { [k: string]: Client } = {};
const RESOLVER_QUEUE: { [k: string]: Array<ClientResolver> } = {};
const NAME_BINDERS: { [k: string]: Array<ClientBinder> } = {};

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

            if (NAME_BINDERS[deviceInfo.friendlyName]) {
                NAME_BINDERS[deviceInfo.friendlyName].forEach((handle) => {
                    handle(serial);
                });
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

function requireClient(serial: string, timeout?: number): Promise<Client> {
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

function setNameCallback(name: string, cb: ClientBinder) : void  {
    if (!(NAME_BINDERS[name])) {
        NAME_BINDERS[name] = [];
    }

    NAME_BINDERS[name].push(cb);
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

    getSwitchState() : WemoSwitchState {
        return core._await(requireClient(this.serial, BLOCK_TIMEOUT).then((client) => {
            return new Promise((resolve, reject) => {
                client.getBinaryState((err, state) => {
                    if (err) {
                        reject("getBinaryState failed: " + err);
                    } else {
                        resolve(state as WemoSwitchState);
                    }
                })
            });
        }));
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
                });
            });
        }));
    }

    onStateChange(cb: (newState: WemoSwitchState) => void) {
        requireClient(this.serial, BLOCK_TIMEOUT).then((client) => {
            client.on('binaryState', (value: string) => {
                core._detach(() => cb(value as WemoSwitchState));
            });
        });
    }

    getInstantPower() : number {
        return core._await(requireClient(this.serial, BLOCK_TIMEOUT).then((client) => {
            return new Promise<number>((resolve, reject) => {
                client.getInsightParams((err, _1, instantPower, _2) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(parseInt(instantPower));
                    }
                });
            });
        }));
    }
}

export function onConnectToName(name: string, cb: (client: WemoDevice) => void) {
    setNameCallback(name, (serial) => {
        core._detach(() => cb(new WemoDevice(serial)))
    })
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
