"use strict";
exports.__esModule = true;
var lpc_grove_js_1 = require("./lpc-grove-js");
//var AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
var UltrasonicDigitalSensor = lpc_grove_js_1["default"].sensors.UltrasonicDigital;
//var AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
//var DHTDigitalSensor = GrovePi.sensors.DHTDigital
//var LightAnalogSensor = GrovePi.sensors.LightAnalog
var DigitalButtonSensor = lpc_grove_js_1["default"].sensors.DigitalButton;
//var LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
var RotaryAngleAnalogSensor = lpc_grove_js_1["default"].sensors.RotaryAnalog;
//var DustDigitalSensor = GrovePi.sensors.dustDigital
//var DigitalOutput = GrovePi.sensors.DigitalOutput
var MoistureSensor = lpc_grove_js_1["default"].sensors.MoistureSensor;
var LED = lpc_grove_js_1["default"].sensors.LED;
var Buzzer = lpc_grove_js_1["default"].sensors.Buzzer;
var grove;
(function (grove) {
    var PortType;
    (function (PortType) {
        PortType[PortType["ULTRASONIC"] = 0] = "ULTRASONIC";
        PortType[PortType["BUTTON"] = 1] = "BUTTON";
        PortType[PortType["LED"] = 2] = "LED";
        PortType[PortType["MOISTURE"] = 3] = "MOISTURE";
        PortType[PortType["BUZZER"] = 4] = "BUZZER";
        PortType[PortType["ROTARY"] = 5] = "ROTARY";
    })(PortType || (PortType = {}));
    var _configuredPorts;
    var _board;
    var _typeToConstructor = new Map([
        [PortType.ULTRASONIC, function (port) { return new UltrasonicDigitalSensor(port); }],
        [PortType.BUTTON, function (port) { return new DigitalButtonSensor(port); }],
        [PortType.LED, function (port) { return new LED(port); }]
    ]);
    function initialize() {
        _board = new lpc_grove_js_1["default"].board({
            onError: function (msg) {
                console.log("Board failed to initialize: ", msg);
            },
            onInit: function () {
                console.log("GrovePi board initialized!");
            }
        });
        _board.init();
        _configuredPorts = {};
    }
    grove.initialize = initialize;
    function createOrGetSensor(port, type) {
        var storedPort = _configuredPorts[port];
        if (storedPort == undefined) {
            var ctor = _typeToConstructor.get(type);
            var sensorObject = ctor ? ctor(port) : undefined;
            if (sensorObject == undefined) {
                throw Error("Could not get ctor for type: " + type);
            }
            _configuredPorts[port] = {
                type: type,
                sensor: sensorObject
            };
            return sensorObject;
        }
        else if (storedPort.type != type) {
            throw Error("Sensor type mismatch: was " + storedPort.type + ", expected " + type);
        }
        return storedPort.sensor;
    }
    // Led
    function ledOn(port) {
        var led = createOrGetSensor(port, PortType.LED);
        led.turnOn();
    }
    grove.ledOn = ledOn;
    function ledOff(port) {
        var led = createOrGetSensor(port, PortType.LED);
        led.turnOff();
    }
    grove.ledOff = ledOff;
    // Ultrasonic Ranger
    function pollUltrasonicRanger(port) {
        var ultrasonicSensor = createOrGetSensor(port, PortType.ULTRASONIC);
        ultrasonicSensor.on('change', function (_res) {
            // Do on Change
        });
        ultrasonicSensor.watch();
    }
    grove.pollUltrasonicRanger = pollUltrasonicRanger;
    // Button
    function pollButtonPress(port) {
        var buttonSensor = createOrGetSensor(port, PortType.BUTTON);
        buttonSensor.on('down', function (res) {
            if (res == 'longpress') {
                // Handle long press
            }
            else {
                // handle short press
            }
        });
        buttonSensor.watch();
    }
    grove.pollButtonPress = pollButtonPress;
    // Rotary Angle
    function pollRotaryAngle(port) {
        var rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY);
        rotaryAngleSensor.start();
        rotaryAngleSensor.on('data', function (_res) {
            // Do on Change
        });
    }
    grove.pollRotaryAngle = pollRotaryAngle;
    function getRotaryAngleValue(port) {
        var rotaryAngleSensor = createOrGetSensor(port, PortType.ROTARY);
        return rotaryAngleSensor.read();
    }
    grove.getRotaryAngleValue = getRotaryAngleValue;
    // Moisture Sensor
    function getMoistureValue(port) {
        var moistureSensor = createOrGetSensor(port, PortType.MOISTURE);
        return moistureSensor.read();
    }
    grove.getMoistureValue = getMoistureValue;
    // Buzzer
    function buzzerOn(pin) {
        var buzzer = createOrGetSensor(pin, PortType.BUZZER);
        buzzer.turnOn();
    }
    grove.buzzerOn = buzzerOn;
    function buzzerOff(pin) {
        var buzzer = createOrGetSensor(pin, PortType.BUZZER);
        buzzer.turnOff();
    }
    grove.buzzerOff = buzzerOff;
})(grove || (grove = {}));
exports["default"] = grove;
