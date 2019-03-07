import { DMX } from 'dmx';

import { log } from './console';

import { _await } from './core-exec';

let allFixtures  : Array<Fixture> = [];
let universeName : string = 'pidmx';
let dmx : DMX.DMX;

export class Fixture {
    public name : string;
    public numChannels : number;
    public channels : Array<Channel>;
    public redChannel : number;
    public greenChannel : number;
    public blueChannel : number;
    public masterBrightnessChannel : number;
    public RGBChannelsSet : boolean;
    public masterBrightnessChannelSet : boolean;

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
        this.RGBChannelsSet = false;
        this.masterBrightnessChannelSet = false;
    }
}

export class Channel {
    public value : number;

    constructor() {
        this.value = 0;
    }
}

export function initialize() {
    dmx = new DMX.DMX();
    //const universe = dmx.addUniverse(universeName, 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
    const universe = dmx.addUniverse(universeName, 'null');
    log(universe);
    return;
}

// Method to create new DMX fixture
export function createFixture(name: string, numChannels: number): void {
    allFixtures.push(new Fixture(name, numChannels));
}

export function updateFixtureChannel(name: string, channel: number, value: number) { 
    let fixture = findFixtureByName(name);
    if (fixture) fixture.channels[channel].value = value;
}

export function send(): void {
    dmx.update(universeName, generateDMXJson());
}

export function findFixtureByName(name: string) : Fixture {
    for (let i = 0; i < allFixtures.length; i++){
        let fixture = allFixtures[i];
        if (fixture.name == name){
            return fixture;
        }
    }
    return null;
}

export function generateDMXJson(): any {
    let dmxChannels : any = {};
    let channelCount = 1;
    for (let i = 0; i < allFixtures.length; i++) {
        let fixture = allFixtures[i];
        for (let j = 0; j < fixture.numChannels; j++) {
            let index : number = channelCount + j;
            dmxChannels[index as number] = fixture.channels[j];
        }
    }
    return dmxChannels;
}