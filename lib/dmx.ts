import { Dmx } from 'dmx';

import { log } from './console';

import { _await } from './core-exec';

let allFixtures  : Array<Fixture> = [];
let universeName : string = 'pidmx';
let dmx : Dmx.DMX;

/* 
 * Class to store information about a fixture's channels.
 * In DMX512 you can have up to a total of 512 channels.
 */
export class Fixture {
    public name : string;
    public numChannels : number;
    public channels : Array<Channel>;

    constructor(fixtureName : string, numberChannels : number) {
        this.name = fixtureName;
        this.channels = [];
        this.numChannels = numberChannels;
        let i = 0;
        while (i < this.numChannels) {
            let channel = new Channel();
            this.channels.push(channel);
            i++;
        }
    }
}

export class Channel {
    public value : number;

    constructor() {
        this.value = 0;
    }
}

export function initialize() {
    dmx = new Dmx.DMX();
    // TO DO: make the set up of the DMX USB more dynamic so different ports & devices can be used
    const universe = dmx.addUniverse(universeName, 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
    //const universe = dmx.addUniverse(universeName, 'null');
    log(universe);
    console.log(universe);
    return;
}

/* Method to create new DMX fixture
 * The order that the fixtures are declared needs to match the way
 * the rig is physically wired. This will change once we add support
 * for the layour editor extension
 */
export function createFixture(name: string, numChannels: number) : void {
    allFixtures.push(new Fixture(name, numChannels));
}

export function updateFixtureChannel(name: string, channel: number, value: number) { 
    let fixture = findFixtureByName(name);
    if (fixture) fixture.channels[channel].value = value;
}

/* Send the updated channel information to the DMX controller */
export function send() : void {
    dmx.update(universeName, generateDMXJson());
}

export function findFixtureByName(name: string) : Fixture {
    for (let i = 0; i < allFixtures.length; i++){
        let fixture = allFixtures[i];
        if (fixture.name == name) return fixture;
    }
    return null;
}

export function generateDMXJson() : any {
    let dmxChannels : any = {};
    let channelCount = 1;
    for (let i = 0; i < allFixtures.length; i++) {
        let fixture = allFixtures[i];
        for (let j = 0; j < fixture.numChannels; j++) {
            let index : number = channelCount + j;
            dmxChannels[index as number] = fixture.channels[j];
        }
    }
    log(dmxChannels);
    console.log(dmxChannels);
    return dmxChannels;
}

/* Eventually the rig editor will generate blocks like
 * "show scene", "play pattern", "loop pattern", "stop pattern"
 * scenes -> patterns -> shows (the user can do all 3 in makecode or
 * just do the actual triggering mechanisms therefore creating a show)
 */