import { GrovePi } from 'node-grovepi';
import { _detach, onExit, onInit } from './core-exec';
import * as loops from './loops';

// Type aliases
type DigitalOutput = GrovePi.sensors.DigitalOutput;
// type AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
type UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital;
// type AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
// type DHTDigitalSensor = GrovePi.sensors.DHTDigital
type LightAnalogSensor = GrovePi.sensors.LightAnalog
type DigitalButtonSensor = GrovePi.sensors.DigitalButton;
type LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
type RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog;
type MoistureAnalogSensor = GrovePi.sensors.base.Analog;
type TemperatureAnalogSensor = GrovePi.sensors.TemperatureAnalog;
// type DustDigitalSensor = GrovePi.sensors.dustDigital
// type DigitalOutput = GrovePi.sensors.DigitalOutput

type LED = DigitalOutput;
type Buzzer = DigitalOutput;

// Constructor aliases
const UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital;
const DigitalButtonSensor = GrovePi.sensors.DigitalButton;
const RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog;
const LightAnalogSensor = GrovePi.sensors.LightAnalog;
const LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog;
const MoistureAnalogSensor = GrovePi.sensors.base.Analog;
const TemperatureAnalogSensor = GrovePi.sensors.TemperatureAnalog;

type Sensor = GrovePi.sensors.base.ISensor;


enum PortType {
    ULTRASONIC,
    BUTTON,
    LED,
    MOISTURE,
    BUZZER,
    ROTARY,
    LIGHT,
    SOUND,
    TEMPERATURE
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
    [PortType.LIGHT, (port: number) => new LightAnalogSensor(port)],
    [PortType.SOUND, (port: number) => new LoudnessAnalogSensor(port)],
    [PortType.MOISTURE, (port: number) => new MoistureAnalogSensor(port)],
    [PortType.TEMPERATURE, (port: number) => new TemperatureAnalogSensor(port)]
]);

onInit(() => {
    board = new GrovePi.board();
    board.init();

    configuredPorts = {};
});

onExit(() => {
    configuredPorts = {};

    board.close();
})

/**
 * Configure a sensor on a given port. If a sensor is already configured on that
 * port, return it. If a sensor is requested for a port, where a sensor of a
 * different type is already defined, an Error is thrown.
 *
 * @param port The port number on the GrovePi board to use.
 * @param type The Type of the sensor to configure on the given port number
 * 
 * @throws If a port is requested twice for multiple types.
 */
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
export function pollUltrasonicRanger(port: number, handler: (value: number) => void) {
    const ultrasonicSensor = createOrGetSensor(port, PortType.ULTRASONIC) as UltrasonicDigitalSensor;

    ultrasonicSensor.on('change', (value: any) => {
        _detach(() => handler(value));
    })
    ultrasonicSensor.watch()
}

// Button
export function pollLongButtonPress(port: number, handler: () => void) {
    const buttonSensor = createOrGetSensor(port, PortType.BUTTON) as DigitalButtonSensor;

    buttonSensor.on('down', (res: string) => {
        if ('longpress' === res) {
            _detach(handler);
        }
    })
    buttonSensor.watch();
}

export function pollShortButtonPress(port: number, handler: () => void) {
    const buttonSensor = createOrGetSensor(port, PortType.BUTTON) as DigitalButtonSensor;

    buttonSensor.on('down', (res: string) => {
        if ('longpress' !== res) {
            _detach(handler);
        }
    })
    buttonSensor.watch();
}

// Rotary Angle
// export function pollRotaryAngle(port: number) {
//     const rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY) as RotaryAngleAnalogSensor;

//     rotaryAngleSensor.start()
//     // tslint:disable-next-line:variable-name
//     rotaryAngleSensor.on('data', (_res: any) => {
//         // Do on Change
//     })
// }

export function getRotaryAngleValue(port: number) {
    const rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY) as RotaryAngleAnalogSensor;

    return rotaryAngleSensor.read();
}

export function getUltrasonicRangerValue(port: number) {
    const ultrasonicRanger = createOrGetSensor(port, PortType.ULTRASONIC) as UltrasonicDigitalSensor;

    return ultrasonicRanger.read();
}

// Buzzer
export function buzzerOn(pin: number) {
    const buzzer = createOrGetSensor(pin, PortType.BUZZER) as Buzzer;
    buzzer.turnOn();
}

export function buzzerOff(pin: number) {
    const buzzer = createOrGetSensor(pin, PortType.BUZZER) as Buzzer;
    buzzer.turnOff()
}

export function buzzerBeep(pin: number, ms: number) {
    const buzzer = createOrGetSensor(pin, PortType.BUZZER) as Buzzer;

    buzzer.turnOn();
    loops.pause(ms);
    buzzer.turnOff();
}

// Light
export function getLightValue(pin: number) {
    const light = createOrGetSensor(pin, PortType.LIGHT) as LightAnalogSensor;

    return light.read();
}

// Sound
export function getSoundValue(pin: number) {
    const sound = createOrGetSensor(pin, PortType.SOUND) as LoudnessAnalogSensor;

    return sound.read();
}

// Moisture
export function getMoistureValue(pin: number) {
    const moisture = createOrGetSensor(pin, PortType.MOISTURE) as MoistureAnalogSensor;

    return moisture.read();
}

// Temperature
export function getTemperatureValue(pin: number) {
    const temp = createOrGetSensor(pin, PortType.TEMPERATURE) as TemperatureAnalogSensor;

    return temp.read();
}