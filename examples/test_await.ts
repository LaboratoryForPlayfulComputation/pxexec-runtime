import * as console from '../lib/console';
import * as _core from '../lib/core-exec';

import Fiber = require('fibers');

function somePromiseFunction() {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve(Math.random());
        }, 4000);
    });
}

Fiber(() => {
    console.log("The first message!");
    console.log(_core._await(somePromiseFunction()));
}).run()