var AnalogSensor = require('./base/analogSensor')
var helpers = require('./helpers')
var commands = require('../commands')

function SoundAnalogSensor(pin) {
    AnalogSensor.apply(this, Array.prototype.slice.call(arguments))
}
SoundAnalogSensor.prototype = new SoundAnalogSensor()

SoundAnalogSensor.prototype.read = function() {
    return AnalogSensor.prototype.read.call(this)
}

module.exports = SoundAnalogSensor