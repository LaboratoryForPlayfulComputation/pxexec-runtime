import * as SerialPort from 'serialport';
import { log } from './console';
import { _await, _detach } from './core-exec';

let serial: any;

type KeyValuePair = [string, number];
type Handler<T> = (x: T) => void;
const numHandlers: Array<Handler<IHandlerPacket<number>>> = [];
const keyValueHandlers: Array<Handler<IHandlerPacket<KeyValuePair>>> = [];
const stringHandlers: Array<Handler<IHandlerPacket<string>>> = []

export type recValType = "number" | "string" | "keyvalue";

let RADIOPORT: string = '/dev/cu.usbmodem1412';

export enum RPiPort {
    PORT1,
    PORT2,
    PORT3,
    PORT4
}

export function initialize() {
    serial = new SerialPort(RADIOPORT, { baudRate: 115200, dataBits: 8, stopBits: 1 });
    serial.on("open", () => {
        log('Open')
        log(RADIOPORT)
    });
    serial.on('readable', () => {
        log('Data:', serial.read())
    });

    serial.on('data', (data: Buffer) => {
        log('Data:', data.toString());
    });

    const lineReader = serial.pipe(new SerialPort.parsers.Readline({ delimiter: '\n' }));

    lineReader.on('data', (dataBuffer: Buffer) => {
        const data = dataBuffer.toString();
        log(data);

        // tslint:disable-next-line:prefer-const
        let parsedData = {} as IPacket;

        const arr = data.toString().split(":");

        try {
            parsedData.time = +arr[1];
            parsedData.serial = +arr[2];
            parsedData.kind = arr[3] as recValType;
            parsedData.signal = +arr[4];

        } catch (e) {
            log("error: " + e.toString())
            return;
        }


        switch (parsedData.kind) {
            case "number":
                parsedData.value = +arr[0];
                numHandlers.forEach((h) => _detach(() => h(parsedData as IHandlerPacket<number>)))
                break;
            case "string":
                parsedData.value = arr[0];
                stringHandlers.forEach((h) => _detach(() => h(parsedData as IHandlerPacket<string>)))
                break;
            case "keyvalue":
                parsedData.value = arr[0].split(">") as KeyValuePair;
                keyValueHandlers.forEach((h) => _detach(() => h(parsedData as IHandlerPacket<KeyValuePair>)))
                break;
        }

    });
}

export function init(port: RPiPort) {

    switch (port) {
        case RPiPort.PORT1:
            RADIOPORT = '/dev/cu.usbmodem1412'
            break;
        case RPiPort.PORT2:
            RADIOPORT = '/dev/cu.usbmodem1422'
            break;
    }
}


interface IPacket {
    kind: recValType,
    serial: number,
    signal: number,
    time: number,
    value: number | string | KeyValuePair,
}

interface IHandlerPacket<T> {
    serial: number,
    signal: number,
    time: number,
    value: T,
}

export function onReciveNumber(handler: Handler<IHandlerPacket<number>>): void {
    numHandlers.push(handler);
}

export function onReciveKeyValue(handler: Handler<IHandlerPacket<KeyValuePair>>): void {
    keyValueHandlers.push(handler);
}

export function onReciveString(handler: Handler<IHandlerPacket<string>>): void {
    stringHandlers.push(handler);
}

export function sendNumber(num: string): void {
    serial.flush();
    serial.write(num);
}

export function radioSetGroup(num: number): void {
    const str: string = "g" + num
    serial.write(str);
}