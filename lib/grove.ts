import * as GrovePi from './lpc-grove-js';

//var Commands = GrovePi.commands
//var Board = GrovePi.board
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

namespace grove {

    enum PortType {
        LED
    }

    interface StoredPort {
        type: PortType,
        sensor: any,
    }

    var _configuredPorts: { [k: number]: StoredPort };

    var _board: GrovePi.board | undefined;

    const _typeToConstructor: Map<PortType, (port: number) => any> = new Map([
        [PortType.LED, (port: number) => new LED(port)]
    ]);

    export function initialize(): void {
        _board = new GrovePi.board({
            onError: (msg: string) => {
                console.log("Board failed to initialize: ", msg);
            },
            onInit: () => {
                console.log("GrovePi board initialized!");
            }
        });
        _board.init();

        _configuredPorts = {};
    }

    function createOrGetSensor(port: number, type: PortType): GrovePi.base.sensor {
        var storedPort = _configuredPorts[port];
        if (storedPort == undefined) {
            let ctor = _typeToConstructor.get(type);
            let sensorObject = ctor ? ctor(port) : undefined;
            if (sensorObject == undefined) {
                throw Error("Could not get ctor for type: " + type);
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
        const led = createOrGetSensor(port, PortType.LED);
        led.turnOn();
    }

    export function ledOff(port: number) {
        const led = createOrGetSensor(port, PortType.LED);
        led.turnOff();
    }

    // Ultrasonic Ranger
    export function pollUltrasonicRanger(port: number) {
        var ultrasonicSensor = new UltrasonicDigitalSensor(port)

        ultrasonicSensor.on('change', function (_res: any) {
            // Do on Change
        })
        ultrasonicSensor.watch()
    }

    // Button
    export function pollButtonPress(port: number) {
        var buttonSensor = new DigitalButtonSensor(port)

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
        var rotaryAngleSensor = new RotaryAngleAnalogSensor(port)

        rotaryAngleSensor.start()
        rotaryAngleSensor.on('data', function (_res: any) {
            // Do on Change
        })
    }

    export function getRotaryAngleValue(port: number) {
        var rotaryAngleSensor = new RotaryAngleAnalogSensor(port)

        return rotaryAngleSensor.read()
    }

    // Moisture Sensor
    export function getMoistureValue(port: number) {
        var moistureSensor = new MoistureSensor(port)

        return moistureSensor.read()
    }

    // Buzzer
    export function buzzerOn(pin: number) {
        var buzzer = new Buzzer(pin)
        buzzer.turnOn()
    }

    export function buzzerOff(pin: number) {
        var buzzer = new Buzzer(pin)
        buzzer.turnOff()
    }
}

export default grove;