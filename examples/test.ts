import * as console from '../lib/console';
import * as _core from '../lib/core-exec';
import * as loops from '../lib/loops';
import * as network from '../lib/net2';

import Fiber = require('fibers');

Fiber(() => {
    network.init();
    loops.forever(() => {
        console.log("Message every 2");
        loops.pause(2000);
    });
    loops.forever(() => {
        console.log("Message every 5");
        loops.pause(5000);
    });

    const c = network.waitForConnection(_core.env.PEER_ID);
    c.send("Hello world!");
}).run()