import { DMX } from 'dmx';

import { log } from './console';

import { _await } from './core-exec';

export function initialize() {
    const dmx = new DMX.DMX();
    //const universe = dmx.addUniverse('test', 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
    const universe = dmx.addUniverse('test', 'null');
    log(universe);
    return;
}

// Method to create new DMX fixture
export function createFixture(): void {
}