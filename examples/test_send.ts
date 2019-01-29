import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as loops from '../lib/loops';
import * as netsimple from '../lib/netsimple';

_core.main(() => {
    netsimple.init();
    loops.forever(() => {
        console.log("Message every 2");
        loops.pause(2000);
    });
    loops.forever(() => {
        console.log("Message every 5");
        loops.pause(5000);
    });

    netsimple.waitForConnection(_core.env.PEER_ID);
    
    netsimple.sendString(_core.env.PEER_ID, "Hello world!");
});