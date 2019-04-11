import * as _core from '../lib/core-exec';
import * as console from '../lib/console';

_core.main(() => {
    console.error("Log level is error.");
    console.warn("Log level is warn.");
    console.info("Log level is info.");
    console.verbose("Log level is verbose.");
    console.debug("Log level is debug.");

    console.info("Runtime base is: ", _core.RUNTIME_BASE);
});