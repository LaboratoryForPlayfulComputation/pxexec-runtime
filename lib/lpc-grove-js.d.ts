import { EventEmitter } from "events";

declare namespace GrovePi {
    interface Options {
        debug?: boolean,
        onError?: (err: Error) => void,
        onInit?: (didInit: boolean) => void,
    }
    namespace commands {
        const dRead: number[];
        const dWrite: number[];
        const aRead: number[];
        const aWrite: number[];
        const pMode: number[];
        const uRead: number[];
        const version: number[];
        const acc_xyz: number[];
        const rtc_getTime: number[];
        const dht_temp: number[];

        const ledBarInit: number[];
        const ledBarOrient: number[];
        const ledBarLevel: number[];
        const ledBarSetOne: number[];
        const ledBarToggleOne: number[];
        const ledBarSet: number[];
        const ledBarGet: number[];

        const fourDigitInit: number[];
        const fourDigitBrightness: number[];
        const fourDigitValue: number[];
        const fourDigitValueZeros: number[];
        const fourDigitIndividualDigit: number[];
        const fourDigitIndividualLeds: number[];
        const fourDigitScore: number[];
        const fourDigitAnalogRead: number[];
        const fourDigitAllOn: number[];
        const fourDigitAllOff: number[];

        const storeColor: number[];
        const chainableRgbLedInit: number[];
        const chainableRgbLedDigital: number[];
        const chainableRgbLedTest: number[];
        const chainableRgbLedSetPattern: number[];
        const chainableRgbLedSetLevel: number[];

        const irRead: number[];
        const irRecvPin: number[];

        const dustSensorRead: number[];
        const dustSensorEn: number[];
        const dustSensorDis: number[];

        const encoderRead: number[];
        const encoderEn: number[];
        const encoderDis: number[];

        const flowRead: number[];
        const flowEn: number[];
        const flowDis: number[];

        const unused: number;
    }
    class board {
        public INPUT: string;
        public OUTPUT: string;
        public BYTESLEN: string;
        constructor(opts?: Options);
        public init(): void;
        public close(): void;
        public run(tasks: Array<() => Promise<void>>): void;
        public checkStatus(): boolean;
        public readByte(): Buffer | false;
        public readBytes(): Buffer | false;
        public writeBytes(bytes: number[]): boolean;
        public pinMode(pin: number, mode: string): Buffer | false | undefined;
        public debug(msg: string): void;
        public wait(ms: number): void;
        public version(): string | false;
    }
    namespace sensors {
        namespace base {
            interface ISensor {}
            class Sensor extends EventEmitter implements ISensor {
                // These functions are filled out in the prototype, but are
                // overridden with different signatures in subclass-types
                //public read(): void;
                //public write(): void;
                public stream(delay: number | undefined, cb: (res: number) => void): void;
                public stopStream(): void;
                public watch(delay?: number): void;
                public stopWatch(): void;
            }
            class Analog extends Sensor {
                constructor(pin: number);
                public read(length?: number): number | false;
                public write(value: number): boolean;
            }
            class Digital extends Sensor {
                constructor(pin: number);
                public write(value: number): boolean;
                public read(): number | false;
            }
            class I2C extends Sensor {
            }
        }
        class DigitalInput extends base.Digital { }
        class DigitalOutput extends base.Digital {
            public turnOn(): boolean;
            public turnOff(): boolean;
        }
        class AccelerationI2C extends base.I2C {
            public read(): number[] | false;
        }
        class AirQualityAnalog extends base.Analog { }
        class ChainableRGBLedDigital extends base.Digital {
            constructor(pin: number, numLeds: number);
            public init(): boolean;
            public setPattern(pattern: number, whichLed: number): boolean;
            public setModulo(offset: number, divisor: number): boolean;
            public setLevel(level: number, reverse: boolean): boolean;
        }
        // This class breaks the inheritance relationship on the read() function
        class DHTDigital extends base.Sensor {
            public VERSION : { [k : string] : number };
            public CELSIUS : string;
            public FAHRENHEIT : string;
            constructor(pin : number, moduleType : number, scale : string);
            public write(value: number): boolean;
            public read() : number[] | false;
        }
        // Methods on() and off() conflict with the names on() and off() in EventEmitter
        class FourDigitDigital implements base.ISensor {
            public stream(delay: number | undefined, cb: (res: number) => void): void;
            public stopStream(): void;
            public watch(delay?: number): void;
            public stopWatch(): void;
            constructor(pin: number);
            public write(value: number): boolean;
            public read(): number | false;
            public init() : boolean;
            public setNumber(value: number, useLeadingZero: boolean) : boolean;
            public setBrightness(brightness : number) : boolean;
            public setSegment(segment : number, leds : number) : boolean;
            public setScore(left : number, right : number) : boolean;
            public monitor(analog : number, duration : number) : boolean;
            public on() : boolean;
            public off() : boolean;
        }
        class LedBarDigital extends base.Digital {
            constructor(pin : number, orientation : number);
            public init() : boolean;
            public setOrientation(orientation : number) : boolean;
            public setLevel(level : number) : boolean;
            public setLed(led : number, state : number) : boolean;
            public toggleLed(led : number) : boolean;
            public setBits(led : number, state : number) : boolean;
            public getBits() : number | false;
        }
        class LightAnalog extends base.Analog {}
        class RTCI2C extends base.I2C {
            public read() : Buffer | false;
        }
        class TemperatureAnalog  extends base.Analog {}
        class UltrasonicDigital extends base.Digital {}
        class IRReceiver extends base.Sensor {
            public read() : Buffer | false;
            public write() : boolean;
        }
        class SPDTRelay implements base.ISensor {
            public stream(delay: number | undefined, cb: (res: number) => void): void;
            public stopStream(): void;
            public watch(delay?: number): void;
            public stopWatch(): void;
            constructor(pin: number);
            public write(value: number): boolean;
            public read(): number | false;
            public on() : boolean;
            public off() : boolean;
        }
        interface dustDigitalAvgMaxResult {
            avg : number,
            max : number
        }
        // This class breaks the inheritance tree.
        class dustDigital extends base.Sensor {
            constructor(pin: number);
            public write(value: number): boolean;
            public read(): number[] | false;
            public enable() : boolean;
            public disable() : boolean;
            public start() : void;
            public stop() : void;
            public readAvgMax() : dustDigitalAvgMaxResult;
        }
        // This class also breaks the inheritance tree.
        class encoderDigital extends base.Sensor{
            constructor(pin: number);
            public write(value : number): boolean;
            public read(): number[] | false;
            public enable() : boolean;
            public disable() : boolean;
        }
        // This class ALSO breaks the inheritance tree ...
        class waterFlowDigital extends base.Sensor {
            constructor(pin: number);
            public write(value : number): boolean;
            public read(): number[] | false;
            public enable() : boolean;
            public disable() : boolean;
        }
        class DigitalButton extends base.Digital {
            constructor(pin : number, longPressDelay? : number);
        }
        class LoudnessAnalog extends base.Analog {}
        class RotaryAnalog extends base.Analog {
            constructor(pin : number, watchDelay? : number, samplesize? : number);
            public start() : void;
            public stop() : void;
        }
        class Buzzer extends DigitalOutput {}
        class LED extends DigitalOutput {}
        class MoistureSensor extends DigitalOutput {}
    }
}

export default GrovePi;