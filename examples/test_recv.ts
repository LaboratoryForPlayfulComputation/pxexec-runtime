import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as netsimple from '../lib/netsimple';

_core.main(() => {
    netsimple.start();
    console.log(netsimple.getId());
    netsimple.onReceiveString((peer: string, message: string) => {
        console.log("Got data: " + message + " from " + peer);
        netsimple.sendString(message, peer);
    })
});