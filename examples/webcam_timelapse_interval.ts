import * as _core from '../lib/core-exec';
import * as loops from '../lib/loops';
import * as webcam from '../lib/webcam';
import * as timelapse from '../lib/timelapse';

_core.main(() => {
    loops.forever(() => {
        timelapse.uploadImage(webcam.capture());
        loops.pause(60000);
    });
});