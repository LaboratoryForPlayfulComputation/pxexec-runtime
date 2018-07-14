var DigitalOutput = require('./sensors/genericDigitalOutputSensor');

module.exports = {
    commands: require('./commands')
  , board: require('./grovepi')
  , sensors: {
      base: {
          Sensor: require('./sensors/base/sensor')
        , Analog: require('./sensors/base/analogSensor')
        , Digital: require('./sensors/base/digitalSensor')
        , I2C: require('./sensors/base/i2cSensor')
      }
    , DigitalInput: require('./sensors/genericDigitalInputSensor')
    , DigitalOutput: DigitalOutput
    , AccelerationI2C: require('./sensors/accelerationI2cSensor')
    , AirQualityAnalog: require('./sensors/airQualityAnalogSensor')
    , ChainableRGBLedDigital: require('./sensors/chainableRGBLedDigitalSensor')
    , DHTDigital: require('./sensors/DHTDigitalSensor')
    , FourDigitDigital: require('./sensors/fourDigitDigitalSensor')
    , LedBarDigital: require('./sensors/ledBarDigitalSensor')
    , LightAnalog: require('./sensors/lightAnalogSensor')
    , RTCI2C: require('./sensors/rtcI2cSensor')
    , TemperatureAnalog: require('./sensors/temperatureAnalogSensor')
    , UltrasonicDigital: require('./sensors/ultrasonicDigitalSensor')
    , IRReceiver: require('./sensors/IRReceiverSensor')
    , SPDTRelay: require('./sensors/SPDTRelay')
    , dustDigital: require('./sensors/dustDigitalSensor')
    , encoderDigital: require('./sensors/encoderDigitalSensor')
    , waterFlowDigital: require('./sensors/waterFlowDigitalSensor')
    , DigitalButton: require('./sensors/digitalButton')
    , LoudnessAnalog: require('./sensors/loudnessAnalogSensor')     
    , RotaryAnalog: require('./sensors/rotaryAngleAnalogSensor')
    , MoistureAnalog: require('./sensors/moistureAnalogSensor')
    , SoundAnalog: require('./sensors/soundAnalogSensor')
    // Aliases for output sensors
    , LED: DigitalOutput
    , Buzzer : DigitalOutput
  }
}
