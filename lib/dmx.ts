import { DMX } from 'dmx';

import { log } from './console';

import { _await } from './core-exec';

enum Colors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}

let allFixtures : Array<Fixture> = [];

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
    const dmx = new DMX.DMX();
    //const universe = dmx.addUniverse('test', 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
    const universe = dmx.addUniverse('test', 'null');
    log(universe);
    return;
}

// Method to create new DMX fixture
export function createFixture(name: string, numChannels: number): void {
    allFixtures.push(new Fixture(name, numChannels));
}

export function updateFixtureChannel(name: string, channel: number, value: number) { 
    let fixture = findFixtureByName(name);
    if (fixture) {
        fixture.channels[channel].value = value;
        // update dmx
    }
}

export function send(): void {
    // send dmx
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