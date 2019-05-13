import * as _core from '../lib/core-exec';
import * as loops from '../lib/loops';
import * as wemo from '../lib/wemo';

_core.main(() => {
    const w = new wemo.WemoDevice("22C8B1K010875A");
    w.setSwitchState(wemo.WemoSwitchState.ON);
    loops.onInterval(10000, () => {
        w.setSwitchState(wemo.WemoSwitchState.OFF);
        loops.pause(5000);
        w.setSwitchState(wemo.WemoSwitchState.ON);
    });
});