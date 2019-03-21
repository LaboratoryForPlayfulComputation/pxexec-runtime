import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as radio from '../lib/radio';
import * as loops from '../lib/loops';



_core.main(() => {
    radio.init(radio.RPiPort.PORT2)
    radio.initialize()
    loops.forever(() => { console.log('hello'); loops.pause(5000) });
    // radio.onReciveNumber(({ value }) => { console.log('recived number ' + value) })

    // radio.onReciveKeyValue(({ value }) => { console.log(`recived key ${value[0]} value ${value[1]}`) })

    // radio.onReciveString(({ value }) => { console.log('recived string ' + value) })

    radio.sendNumber("4");
});