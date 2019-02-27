import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as radio from '../lib/radio';
import * as loops from '../lib/loops';

_core.main(() => {
    radio.initialize()
    loops.forever(() => { console.log('hello'); loops.pause(5000) });
    radio.onReciveNumber((x: number) => { console.log('recived number ' + x) })
    radio.onReciveKeyValue((x: any) => { console.log(`recived key ${x.key} value ${x.value}`) })
    radio.onReciveString((x: string) => { console.log('recived string ' + x) })
});