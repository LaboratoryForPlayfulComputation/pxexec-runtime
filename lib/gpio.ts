import { Gpio } from 'onoff';
import { _detach } from './core-exec';

export function initialize() {
    return;
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
export const Pins = {
    PIN2: new Gpio(2, Direction.INPUT),
    PIN3: new Gpio(3, Direction.INPUT),
    PIN4: new Gpio(4, Direction.INPUT),
    PIN5: new Gpio(5, Direction.INPUT),
    PIN6: new Gpio(6, Direction.INPUT),
    PIN7: new Gpio(7, Direction.INPUT),
    PIN8: new Gpio(8, Direction.INPUT),
    PIN9: new Gpio(9, Direction.INPUT),
    PIN10: new Gpio(10, Direction.INPUT),
    PIN11: new Gpio(11, Direction.INPUT),
    PIN12: new Gpio(12, Direction.INPUT),
    PIN13: new Gpio(13, Direction.INPUT),
    PIN14: new Gpio(14, Direction.INPUT),
    PIN15: new Gpio(15, Direction.INPUT),
    PIN16: new Gpio(16, Direction.INPUT),
    PIN17: new Gpio(17, Direction.INPUT),
    PIN18: new Gpio(18, Direction.INPUT),
    PIN19: new Gpio(19, Direction.INPUT),
    PIN20: new Gpio(20, Direction.INPUT),
    PIN21: new Gpio(21, Direction.INPUT),
    PIN22: new Gpio(22, Direction.INPUT),
    PIN23: new Gpio(23, Direction.INPUT),
    PIN24: new Gpio(24, Direction.INPUT),
    PIN25: new Gpio(25, Direction.INPUT),
    PIN26: new Gpio(26, Direction.INPUT),
}

export enum PinState {
    LOW = 0,
    HIGH = 1
}

export function read(pin: Gpio): number {
    return pin.readSync();
}

export function write(pin: Gpio, value: PinState): void {
    pin.writeSync(value);
}

export function setDirection(pin: Gpio, direction: Direction): void {
    pin.setDirection(direction);
}

export function setEdge(pin: Gpio, edge: Edge): void {
    pin.setEdge(edge);
}

export function setActiveLow(pin: Gpio): void {
    pin.setActiveLow(true);
}

export function setActiveHigh(pin: Gpio): void {
    pin.setActiveLow(false);
}

function addWatchToPin(pin: Gpio, handler: any, edge?: Edge) {
    if (edge) {
        pin.setDirection(Direction.INPUT);
        pin.setEdge(Edge.FALLING);
    }
    pin.watch((err, val) => {
        if (!err) {
            _detach(handler);
        }
    })
}

export function onPinHighToLow(pin: Gpio, handler: () => void): void {
    addWatchToPin(pin, handler, Edge.FALLING);
}

export function onPinLowToHigh(pin: Gpio, handler: () => void): void {
    addWatchToPin(pin, handler, Edge.RISING);
}

export function onPinChange(pin: Gpio, handler: (newvalue: PinState) => void): void {
    addWatchToPin(pin, handler, Edge.BOTH);
}

export function watch(pin: Gpio, handler: (newvalue: PinState) => void): void {
    addWatchToPin(pin, handler);
}