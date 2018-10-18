import { GrovePi } from 'node-grovepi';

type AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
type UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital;
type AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
type DHTDigitalSensor = GrovePi.sensors.DHTDigital
type LightAnalogSensor = GrovePi.sensors.LightAnalog
type DigitalButtonSensor = GrovePi.sensors.DigitalButton;
type LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
type RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog;
type FourDigitDigital = GrovePi.sensors.FourDigitDigital;
type DustDigitalSensor = GrovePi.sensors.dustDigital
type DigitalOutput = GrovePi.sensors.DigitalOutput

// Aliases

type LED = DigitalOutput;
type Buzzer = DigitalOutput;

var AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
var UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
var AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
var DHTDigitalSensor = GrovePi.sensors.DHTDigital
var LightAnalogSensor = GrovePi.sensors.LightAnalog
var DigitalButtonSensor = GrovePi.sensors.DigitalButton
var LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
var RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog
var FourDigitDigital = GrovePi.sensors.FourDigitDigital;
var DustDigitalSensor = GrovePi.sensors.dustDigital
var DigitalOutput = GrovePi.sensors.DigitalOutput

type Sensor = GrovePi.sensors.base.ISensor;
type SensorConstructor = (port: number, optData?: any) => Sensor;

namespace grove {

    enum SensorType{
        ULTRASONIC,
        BUTTON,
        LED,
        ACCEL_I2C,
        LOUDNESS,
        AIR_QUALITY,
        BRIGHTNESS,
        DHT,
        DUST,
        // MOISTURE,
        BUZZER,
        ROTARY,
        FOUR,
        // SOUND,
    }

    interface StoredPort {
        type: SensorType,
        sensor: any,
    }

    var _configuredPorts: { [k: number]: StoredPort };

    var _board: GrovePi.board | undefined;

    function _typeToConstructor(k : SensorType) : SensorConstructor {
        switch (k) {
        case SensorType.ULTRASONIC:
            return (port: number) => new UltrasonicDigitalSensor(port);
        case SensorType.BUTTON:
            return (port: number) => new DigitalButtonSensor(port);
        case SensorType.LED:
            return (port: number) => new DigitalOutput(port);
        case SensorType.ACCEL_I2C:
            return (port: number) => new AccelerationI2cSensor(port);
        case SensorType.LOUDNESS:
            return (port: number) => new UltrasonicDigitalSensor(port);
        case SensorType.AIR_QUALITY:
            return (port: number) => new AirQualityAnalogSensor(port);
        case SensorType.BRIGHTNESS:
            return (port: number) => new LightAnalogSensor(port);
        case SensorType.DHT:
            return (port: number, optData?: any) => {
                return new DHTDigitalSensor(port, optData.moduleType, optData.scale);
            }
        case SensorType.DUST:
            return (port: number) => new DustDigitalSensor(port);
        case SensorType.BUZZER:
            return (port: number) => new DigitalOutput(port);
        case SensorType.ROTARY:
            return (port: number) => new RotaryAngleAnalogSensor(port);
        case SensorType.FOUR:
            return (port: number) => new FourDigitDigital(port);
        default:
            throw new Error("Unrecognized port type: " + k);
        }
    }

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

    function createOrGetSensor(port: number, type: SensorType, optData?: any): Sensor {
        var storedPort = _configuredPorts[port];
        if (storedPort == undefined) {
            let ctor = _typeToConstructor(type);
            let sensorObject = ctor ? ctor(port, optData) : undefined;
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

    // Led
    export function ledOn(port: number) {
        const led = <LED>createOrGetSensor(port, SensorType.LED);
        led.turnOn();
    }

    export function ledOff(port: number) {
        const led = <LED>createOrGetSensor(port, SensorType.LED);
        led.turnOff();
    }

    // Acceleration I2c
    export function getAccelerationValue(port: number) {
        var accI2CSensor = <AccelerationI2cSensor>createOrGetSensor(port, SensorType.ACCEL_I2C)

        return accI2CSensor.read()
    }

    // Loudness
    export function getLoudnessValue(port: number) {
        var loudAnalogSensor = <LoudnessAnalogSensor>createOrGetSensor(port, SensorType.LOUDNESS)

        return loudAnalogSensor.read()
    }

    // Air Quality
    export function getAirQualityValue(port: number) {
        var airAnalogSensor = <AirQualityAnalogSensor>createOrGetSensor(port, SensorType.AIR_QUALITY)

        return airAnalogSensor.read()
    }

    // Brightness 
    export function getLightValue(port: number) {
        var lightAnalogSensor = <LightAnalogSensor>createOrGetSensor(port, SensorType.BRIGHTNESS)

        return lightAnalogSensor.read()
    }

    // DHT
    export function getDHTValue(port: number, optData?: any) {
        var dhtSensor = <DHTDigitalSensor>createOrGetSensor(port, SensorType.DHT, optData)

        return dhtSensor.read()
    }

    // Dust
    export function pollDustValue(port: number) {
        var dustSensor = <DustDigitalSensor>createOrGetSensor(port, SensorType.DUST)

        dustSensor.start()
        dustSensor.on('data', function (_res: any) {
            // Do on Change
        })
    }

    export function getDustValue(port: number) {
        var dustSensor = <DustDigitalSensor>createOrGetSensor(port, SensorType.DUST)

        return dustSensor.read()
    }

    // Buzzer
    export function buzzerOn(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, SensorType.BUZZER);
        buzzer.turnOn()
    }

    export function buzzerOff(pin: number) {
        var buzzer = <Buzzer>createOrGetSensor(pin, SensorType.BUZZER);
        buzzer.turnOff()
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

    // Four digit
    export function getFourDigitValue(port: number) {
        var fourDigit = <FourDigitDigital>createOrGetSensor(port, SensorType.FOUR)

        return fourDigit.read()
    }

    

    /* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
     * 
    // Moisture Sensor
    export function getMoistureValue(port: number) {
        var moistureSensor = <MoistureSensor>createOrGetSensor(port, SensorType.MOISTURE);

        return moistureSensor.read()
    }*/

    /* This was part of the library node-grovepi when we forked it, but it's not in the NPM.
     * 
    //Sound Sensor
    export function getSoundSensorValue(pin: number) {
        var sound = <Sound>createOrGetSensor(pin, SensorType.SOUND);
        return sound.read()
    }*/
}

export default grove;
