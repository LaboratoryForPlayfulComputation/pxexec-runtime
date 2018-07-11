// BEGIN PXT_EXEC PREFIX

import _pxexec from './core-exec';
import loops from './loops';

_pxexec.init();

// END PXT_EXEC PREFIX

loops.forever(function () {
    loops.pause(x)
    console.log("Hello world!");
x = x + 1
    console.log(x.toString());
})
let x = 0
x = 5


// BEGIN PXT_EXEC SUFFIX

_pxexec.run();

// END PXT_EXEC SUFFIX
