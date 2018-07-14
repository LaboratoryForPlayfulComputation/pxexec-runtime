declare module "*";

//import _g = require("./lpc-grove-js");

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
            class Sensor {
                constructor();
                public read(): void;
                public write(): void;
                public stream(delay: number | undefined, cb: (res: number) => void): void;
                public stopStream(): void;
                public watch(delay?: number): void;
                public stopWatch(): void;
            }
            class Analog extends Sensor {
                constructor(pin: number);
            }
            class Digital extends Sensor {
                constructor(pin: number);
            }
            class I2C extends Sensor {
            }
        }
        class DigitalInput {

        }
        class DigitalOutput {

        }
        class AccelerationI2C {

        }
        class AirQualityAnalog {

        }
        class ChainableRGBLedDigital {

        }
        class DHTDigital {

        }
        class FourDigitDigital {

        }
        class LedBarDigital {

        }
        class LightAnalog {

        }
        class RTCI2C {

        }
        class TemperatureAnalog {

        }
        class UltrasonicDigital {

        }
        class IRReceiver {

        }
        class SPDTRelay {

        }
        class dustDigital {

        }
        class encoderDigital {

        }
        class waterFlowDigital {

        }
        class DigitalButton {

        }
        class LoudnessAnalog {

        }
        class RotaryAnalog {

        }
    }
}

//export default _g;