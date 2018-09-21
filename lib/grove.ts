import { GrovePi } from 'node-grovepi';

type DigitalOutput = GrovePi.sensors.DigitalOutput;
type AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
type UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital;
type AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
// type DHTDigitalSensor = GrovePi.sensors.DHTDigital
type LightAnalogSensor = GrovePi.sensors.LightAnalog
type DigitalButtonSensor = GrovePi.sensors.DigitalButton;
type LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
type RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog;
type DustDigitalSensor = GrovePi.sensors.dustDigital
//type DigitalOutput = GrovePi.sensors.DigitalOutput

// Aliases

type LED = DigitalOutput;
type Buzzer = DigitalOutput;

// var AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
var UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
var AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
//var DHTDigitalSensor = GrovePi.sensors.DHTDigital
var LightAnalogSensor = GrovePi.sensors.LightAnalog
var DigitalButtonSensor = GrovePi.sensors.DigitalButton
var LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
var RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog
var DustDigitalSensor = GrovePi.sensors.dustDigital
//var DigitalOutput = GrovePi.sensors.DigitalOutput

type Sensor = GrovePi.sensors.base.ISensor;

namespace grove {

    enum SensorType {
        ULTRASONIC,
        BUTTON,
        LED,
        I2C,
        LOUDNESS,
        AIR,
        LIGHT,
        DHT,
        DUST,
        // MOISTURE,
        BUZZER,
        ROTARY,
        // SOUND,
    }

    interface StoredPort {
        type: SensorType,
        sensor: any,
    }

    var _configuredPorts: { [k: number]: StoredPort };

    var _board: GrovePi.board | undefined;

    const _typeToConstructor: Map<SensorType, (port: number) => Sensor> = new Map([
        [SensorType.ULTRASONIC, (port: number) => new UltrasonicDigitalSensor(port)],
        [SensorType.BUTTON, (port: number) => new DigitalButtonSensor(port)],
        [SensorType.LED, (port: number) => new GrovePi.sensors.DigitalOutput(port)],
        [SensorType.ROTARY, (port: number) => new RotaryAngleAnalogSensor(port)],
        [SensorType.BUZZER, (port: number) => new GrovePi.sensors.DigitalOutput(port)],
        [SensorType.LOUDNESS, (port: number) => new LoudnessAnalogSensor(port)],
        [SensorType.AIR, (port: number) => new AirQualityAnalogSensor(port)],
        [SensorType.LIGHT, (port: number) => new LightAnalogSensor(port)],

        //[SensorType.DHT, (port: number) => new DHTDigitalSensor(port,2,"celcuis")],
        //[SensorType.I2C, (port: number) => new AccelerationI2cSensor(port)],
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

    function createOrGetSensor(port: number, type: SensorType): Sensor {
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
        const led = <LED>createOrGetSensor(port, SensorType.LED);
        led.turnOn();
    }

    export function ledOff(port: number) {
        const led = <LED>createOrGetSensor(port, SensorType.LED);
        led.turnOff();
    }

    // Ultrasonic Ranger
    export function pollUltrasonicRanger(port: number) {
        var ultrasonicSensor = <UltrasonicDigitalSensor>createOrGetSensor(port, SensorType.ULTRASONIC);

        ultrasonicSensor.on('change', function (_res: any) {
            // Do on Change
        })
        ultrasonicSensor.watch()
    }

    // Button
    export function pollButtonPress(port: number) {
        var buttonSensor = <DigitalButtonSensor>createOrGetSensor(port, SensorType.BUTTON);

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
        var rotaryAngleSensor = <RotaryAngleAnalogSensor>createOrGetSensor(port, SensorType.ROTARY);

        rotaryAngleSensor.start()
        rotaryAngleSensor.on('data', function (_res: any) {
            // Do on Change
        })
    }

    export function getRotaryAngleValue(port: number) {
        var rotaryAngleSensor = <RotaryAngleAnalogSensor>createOrGetSensor(port, SensorType.ROTARY);

        return rotaryAngleSensor.read()
    }

    // Loudness
    export function getLoudnessValue(port: number) {
        var loudAnalogSensor = <LoudnessAnalogSensor>createOrGetSensor(port, SensorType.LOUDNESS)

        return loudAnalogSensor.read()
    }

    // Air Quality
    export function getAirQualityValue(port: number) {
        var airAnalogSensor = <AirQualityAnalogSensor>createOrGetSensor(port, SensorType.AIR)

        return airAnalogSensor.read()
    }

    // Light 

    export function getLightValue(port: number) {
        var lightAnalogSensor = <LightAnalogSensor>createOrGetSensor(port, SensorType.LIGHT)

        return lightAnalogSensor.read()
    }

    /* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
     * 
    // Moisture Sensor
    export function getMoistureValue(port: number) {
        var moistureSensor = <MoistureSensor>createOrGetSensor(port, SensorType.MOISTURE);

        return moistureSensor.read()
    }*/

    // Buzzer
    export function buzzerOn(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, SensorType.BUZZER);
        buzzer.turnOn()
    }

    export function buzzerOff(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, SensorType.BUZZER);
        buzzer.turnOff()
    }

    /* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
     * 
    //Sound Sensor
    export function getSoundSensorValue(pin: number) {
        var sound = <Sound>createOrGetSensor(pin, SensorType.SOUND);
        return sound.read()
    }*/
}

export default grove;
