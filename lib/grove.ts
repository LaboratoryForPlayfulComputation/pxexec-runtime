import { GrovePi } from 'node-grovepi';

// Type aliases
type DigitalOutput = GrovePi.sensors.DigitalOutput;
// type AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
type UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital;
// type AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
// type DHTDigitalSensor = GrovePi.sensors.DHTDigital
// type LightAnalogSensor = GrovePi.sensors.LightAnalog
type DigitalButtonSensor = GrovePi.sensors.DigitalButton;
// type LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
type RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog;
// type DustDigitalSensor = GrovePi.sensors.dustDigital
// type DigitalOutput = GrovePi.sensors.DigitalOutput

type LED = DigitalOutput;
type Buzzer = DigitalOutput;

// Constructor aliases
const UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
const DigitalButtonSensor = GrovePi.sensors.DigitalButton
const RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog

type Sensor = GrovePi.sensors.base.ISensor;


enum PortType {
    ULTRASONIC,
    BUTTON,
    LED,
    // MOISTURE,
    BUZZER,
    ROTARY,
    // SOUND,
}

interface IStoredPort {
    type: PortType,
    sensor: any,
}

let configuredPorts: { [k: number]: IStoredPort };
let board: GrovePi.board | undefined;

const typeToConstructor: Map<PortType, (port: number) => Sensor> = new Map([
    [PortType.ULTRASONIC, (port: number) => new UltrasonicDigitalSensor(port)],
    [PortType.BUTTON, (port: number) => new DigitalButtonSensor(port)],
    [PortType.LED, (port: number) => new GrovePi.sensors.DigitalOutput(port)],
    [PortType.ROTARY, (port: number) => new RotaryAngleAnalogSensor(port)],
    [PortType.BUZZER, (port: number) => new GrovePi.sensors.DigitalOutput(port)],
]);

export function initialize(): void {
    board = new GrovePi.board();
    board.init();

    configuredPorts = {};
}

function createOrGetSensor(port: number, type: PortType): Sensor {
    const storedPort = configuredPorts[port];
    if (storedPort === undefined) {
        const ctor = typeToConstructor.get(type);
        const sensorObject = ctor ? ctor(port) : undefined;
        if (sensorObject === undefined) {
            throw Error("Could not get constructor for type: " + type);
        }
        configuredPorts[port] = {
            sensor: sensorObject,
            type,
        };
        return sensorObject;
    } else if (storedPort.type !== type) {
        throw Error("Sensor type mismatch: was " + storedPort.type + ", expected " + type);
    }
    return storedPort.sensor;
}

// Led
export function ledOn(port: number) {
    const led = createOrGetSensor(port, PortType.LED) as LED;
    led.turnOn();
}

export function ledOff(port: number) {
    const led = createOrGetSensor(port, PortType.LED) as LED;
    led.turnOff();
}

// Ultrasonic Ranger
export function pollUltrasonicRanger(port: number) {
    const ultrasonicSensor = createOrGetSensor(port, PortType.ULTRASONIC) as UltrasonicDigitalSensor;

    // tslint:disable-next-line:variable-name
    ultrasonicSensor.on('change', (_res: any) => {
        // Do on Change
    })
    ultrasonicSensor.watch()
}

// Button
export function pollButtonPress(port: number) {
    const buttonSensor = createOrGetSensor(port, PortType.BUTTON) as DigitalButtonSensor;

    buttonSensor.on('down', (res: string) => {
        if ('longpress' === res) {
            // Handle long press
        }
        else {
            // handle short press
        }
    })
    buttonSensor.watch()
}

// Rotary Angle
export function pollRotaryAngle(port: number) {
    const rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY) as RotaryAngleAnalogSensor;

    rotaryAngleSensor.start()
    // tslint:disable-next-line:variable-name
    rotaryAngleSensor.on('data', (_res: any) => {
        // Do on Change
    })
}

export function getRotaryAngleValue(port: number) {
    const rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY) as RotaryAngleAnalogSensor;

    return rotaryAngleSensor.read()
}

export function getUltrasonicRangerValue(port: number) {
    const ultrasonicRanger = createOrGetSensor(port, PortType.ULTRASONIC) as UltrasonicDigitalSensor;

    return ultrasonicRanger.read()
}

/* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
 * 
// Moisture Sensor
export function getMoistureValue(port: number) {
    let moistureSensor = <MoistureSensor>createOrGetSensor(port, PortType.MOISTURE);

    return moistureSensor.read()
}*/

// Buzzer
export function buzzerOn(pin: number) {
    const buzzer = createOrGetSensor(pin, PortType.BUZZER) as Buzzer;
    buzzer.turnOn()
}

export function buzzerOff(pin: number) {
    const buzzer = createOrGetSensor(pin, PortType.BUZZER) as Buzzer;
    buzzer.turnOff()
}

    /* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
     * 
    //Sound Sensor
    export function getSoundSensorValue(pin: number) {
        let sound = <Sound>createOrGetSensor(pin, PortType.SOUND);
        return sound.read()
    }*/

