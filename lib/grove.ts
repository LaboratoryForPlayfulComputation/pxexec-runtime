import GrovePi from './lpc-grove-js';

//type AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
type UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
//type AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
//type DHTDigitalSensor = GrovePi.sensors.DHTDigital
//type LightAnalogSensor = GrovePi.sensors.LightAnalog
type DigitalButtonSensor = GrovePi.sensors.DigitalButton
//type LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
type RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog
//type DustDigitalSensor = GrovePi.sensors.dustDigital
//type DigitalOutput = GrovePi.sensors.DigitalOutput
type MoistureSensor = GrovePi.sensors.MoistureSensor
type LED = GrovePi.sensors.LED
type Buzzer = GrovePi.sensors.Buzzer

//var AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
var UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
//var AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
//var DHTDigitalSensor = GrovePi.sensors.DHTDigital
//var LightAnalogSensor = GrovePi.sensors.LightAnalog
var DigitalButtonSensor = GrovePi.sensors.DigitalButton
//var LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
var RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog
//var DustDigitalSensor = GrovePi.sensors.dustDigital
//var DigitalOutput = GrovePi.sensors.DigitalOutput
var MoistureSensor = GrovePi.sensors.MoistureSensor
var LED = GrovePi.sensors.LED
var Buzzer = GrovePi.sensors.Buzzer

type Sensor = GrovePi.sensors.base.ISensor;

namespace grove {

    enum PortType {
        ULTRASONIC,
        BUTTON,
        LED,
        MOISTURE,
        BUZZER,
        ROTARY
    }

    interface StoredPort {
        type: PortType,
        sensor: any,
    }

    var _configuredPorts: { [k: number]: StoredPort };

    var _board: GrovePi.board | undefined;

    const _typeToConstructor: Map<PortType, (port: number) => Sensor> = new Map([
        [PortType.ULTRASONIC, (port: number) => new UltrasonicDigitalSensor(port)],
        [PortType.BUTTON, (port : number) => new DigitalButtonSensor(port)],
        [PortType.LED, (port: number) => new LED(port)],
        [PortType.ROTARY, (port: number) => new RotaryAngleAnalogSensor(port)],
        [PortType.BUZZER, (port: number) => new Buzzer(port)],
        [PortType.MOISTURE, (port: number) => new MoistureSensor(port)]
    ]);

    export function initialize(): void {
        _board = new GrovePi.board({
            onError: (msg: Error) => {
                console.log("Board failed to initialize: ", msg);
            },
            onInit: () => {
                console.log("GrovePi board initialized!");
            }
        });
        _board.init();

        _configuredPorts = {};
    }

    function createOrGetSensor(port: number, type: PortType): Sensor {
        var storedPort = _configuredPorts[port];
        if (storedPort == undefined) {
            let ctor = _typeToConstructor.get(type);
            let sensorObject = ctor ? ctor(port) : undefined;
            if (sensorObject == undefined) {
                throw Error("Could not get constructor for type: " + type);
            }
            _configuredPorts[port] = {
                type: type,
                sensor: sensorObject
            };
            return sensorObject;
        } else if (storedPort.type != type) {
            throw Error("Sensor type mismatch: was " + storedPort.type + ", expected " + type);
        }
        return storedPort.sensor;
    }

    // Led
    export function ledOn(port: number) {
        const led = <LED>createOrGetSensor(port, PortType.LED);
        led.turnOn();
    }

    export function ledOff(port: number) {
        const led = <LED>createOrGetSensor(port, PortType.LED);
        led.turnOff();
    }

    // Ultrasonic Ranger
    export function pollUltrasonicRanger(port: number) {
        var ultrasonicSensor = <UltrasonicDigitalSensor>createOrGetSensor(port, PortType.ULTRASONIC);

        ultrasonicSensor.on('change', function (_res: any) {
            // Do on Change
        })
        ultrasonicSensor.watch()
    }

    // Button
    export function pollButtonPress(port: number) {
        var buttonSensor = <DigitalButtonSensor>createOrGetSensor(port, PortType.BUTTON);

        buttonSensor.on('down', function (res: string) {
            if (res == 'longpress') {
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
        var rotaryAngleSensor = <RotaryAngleAnalogSensor>createOrGetSensor(port, PortType.ROTARY);

        rotaryAngleSensor.start()
        rotaryAngleSensor.on('data', function (_res: any) {
            // Do on Change
        })
    }

    export function getRotaryAngleValue(port: number) {
        var rotaryAngleSensor = <RotaryAngleAnalogSensor>createOrGetSensor(port, PortType.ROTARY);

        return rotaryAngleSensor.read()
    }

    // Moisture Sensor
    export function getMoistureValue(port: number) {
        var moistureSensor = <MoistureSensor>createOrGetSensor(port, PortType.MOISTURE);

        return moistureSensor.read()
    }

    // Buzzer
    export function buzzerOn(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, PortType.BUZZER);
        buzzer.turnOn()
    }

    export function buzzerOff(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, PortType.BUZZER);
        buzzer.turnOff()
    }
}

export default grove;