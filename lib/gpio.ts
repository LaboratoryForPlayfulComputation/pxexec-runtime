import { Gpio } from 'onoff';
import { _detach, onExit } from './core-exec';

const allPins: { [k: string]: Gpio } = {};


onExit(() => {
    Object.keys(allPins).forEach((k) => {
        if (allPins.hasOwnProperty(k)) {
            allPins[k].unexport();
        }
    });
});

function lazyPin(pin: Pins): Gpio {
    let p = allPins[pin];
    if (!p) {
        p = new Gpio(pin, Direction.INPUT);
        allPins[pin] = p;
    }
    return p;
}

export enum Direction {
    INPUT = "in",
    OUT = "out",
    HIGH = "high",
    LOW = "low"
}

export enum Edge {
    NONE = "none",
    RISING = "rising",
    FALLING = "falling",
    BOTH = "both"
}

// tslint:disable:object-literal-sort-keys
export enum Pins {
    PIN2 = 2,
    PIN3 = 3,
    PIN4 = 4,
    PIN5 = 5,
    PIN6 = 6,
    PIN7 = 7,
    PIN8 = 8,
    PIN9 = 9,
    PIN10 = 10,
    PIN11 = 11,
    PIN12 = 12,
    PIN13 = 13,
    PIN14 = 14,
    PIN15 = 15,
    PIN16 = 16,
    PIN17 = 17,
    PIN18 = 18,
    PIN19 = 19,
    PIN20 = 20,
    PIN21 = 21,
    PIN22 = 22,
    PIN23 = 23,
    PIN24 = 24,
    PIN25 = 25,
    PIN26 = 26,
}

export enum PinState {
    LOW = 0,
    HIGH = 1
}

export function read(pin: Pins): number {
    return lazyPin(pin).readSync();
}

export function write(pin: Pins, value: PinState): void {
    lazyPin(pin).writeSync(value);
}

export function setDirection(pin: Pins, direction: Direction): void {
    lazyPin(pin).setDirection(direction);
}

export function setEdge(pin: Pins, edge: Edge): void {
    lazyPin(pin).setEdge(edge);
}

export function setActiveLow(pin: Pins): void {
    lazyPin(pin).setActiveLow(true);
}

export function setActiveHigh(pin: Pins): void {
    lazyPin(pin).setActiveLow(false);
}

function addWatchToPin(pin: Pins, handler: any, edge?: Edge) {
    const p = lazyPin(pin);
    if (edge) {
        p.setDirection(Direction.INPUT);
        p.setEdge(Edge.FALLING);
    }
    p.watch((err, val) => {
        if (!err) {
            _detach(() => { handler(val) });
        }
    })
}

export function onPinHighToLow(pin: Pins, handler: () => void): void {
    addWatchToPin(pin, handler, Edge.FALLING);
}

export function onPinLowToHigh(pin: Pins, handler: () => void): void {
    addWatchToPin(pin, handler, Edge.RISING);
}

export function onPinChange(pin: Pins, handler: (newvalue: PinState) => void): void {
    addWatchToPin(pin, handler, Edge.BOTH);
}

export function watch(pin: Pins, handler: (newvalue: PinState) => void): void {
    addWatchToPin(pin, handler);
}