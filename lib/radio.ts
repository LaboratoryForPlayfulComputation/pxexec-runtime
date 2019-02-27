import * as SerialPort from 'serialport';
import { log } from './console';
import { _await, _detach } from './core-exec';
// import {serialPort} from 'serialport';

let serial: any;

interface IKeyValuePair { key: string, value: number }
type Handler<T> = (x: T) => void;
const numHandlers: Array<Handler<number>> = [];
const keyValueHandlers: Array<Handler<IKeyValuePair>> = [];
const stringHandlers: Array<Handler<string>> = []


export function initialize() {
    serial = new SerialPort('/dev/cu.usbmodem1422', { baudRate: 115200, dataBits: 8, stopBits: 1 });
    serial.on("open", () => {
        log('Open')
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

        let parsedData: IPacket;
        try {
            parsedData = JSON.parse(data) as IPacket;
        } catch (e) {
            log("error: " + e.toString())
            return;
        }

        switch (parsedData.kind) {
            case "number":
                numHandlers.forEach((h) => _detach(() => h(parsedData.value as number)))
                break;
            case "string":
                stringHandlers.forEach((h) => _detach(() => h(parsedData.value as string)))
                break;
            case "keyvalue":
                keyValueHandlers.forEach((h) => _detach(() => h(parsedData.value as IKeyValuePair)))
                break;
        }

    });
}


interface IPacket {
    kind: "number" | "string" | "keyvalue",
    serial: number,
    signal: number,
    time: number,
    value: number | string | IKeyValuePair,
}


export function onReciveNumber(handler: Handler<number>): void {
    numHandlers.push(handler);
}

export function onReciveKeyValue(handler: Handler<IKeyValuePair>): void {
    keyValueHandlers.push(handler);
}

export function onReciveString(handler: Handler<string>): void {
    stringHandlers.push(handler);
}