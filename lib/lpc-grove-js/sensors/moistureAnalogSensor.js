var AnalogSensor = require('./base/analogSensor')
var helpers = require('./helpers')
var commands = require('../commands')

function MoistureAnalogSensor(pin) {
    AnalogSensor.apply(this, Array.prototype.slice.call(arguments))
}
MoistureAnalogSensor.protoype = new AnalogSensor()

MoistureAnalogSensor.prototype.read = function() {
    return AnalogSensor.prototype.read.call(this)
}

module.exports = MoistureAnalogSensor
