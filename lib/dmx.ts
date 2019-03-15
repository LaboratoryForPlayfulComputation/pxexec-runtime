import DMX = require('dmx');
import { log } from './console';
import { _await } from './core-exec';


let allFixtures  : Array<Fixture> = [];
let universeName : string = 'pidmx';
let dmxController : DMX | undefined;

export enum RGBFixtureType {
    Baisun8ch,
    Coidak8ch
}

/* 
 * Class to store information about a fixture's channels.
 * In DMX512 you can have up to a total of 512 channels.
 */
export class Fixture {
    public numChannels : number;
    public channels : Array<Channel>;

    constructor(numberChannels : number) {
        this.channels = [];
        this.numChannels = numberChannels;
        let i = 0;
        while (i < this.numChannels) {
            let channel = new Channel();
            this.channels.push(channel);
            i++;
        }
    }

    updateChannel(channel: number, value: number): void {
        this.channels[channel-1].value = value;
     }  
}

export class RGBFixture extends Fixture {
    public brightnessChannel : number;
    public redChannel : number;
    public greenChannel : number;
    public blueChannel : number;

    constructor(numberChannels : number, lightType : string) {
        super(numberChannels);
        switch(lightType) {
            case "Baisun8ch":
                this.brightnessChannel = 1;
                this.redChannel = 2;
                this.greenChannel = 3;
                this.blueChannel = 4;
              break;
            default: // "Coidak8ch"
                this.brightnessChannel = 4;
                this.redChannel = 5;
                this.greenChannel = 6;
                this.blueChannel = 7;
          }
    }

    setBrightness(value: number): void { 
        this.channels[this.brightnessChannel-1].value = value;
    }        

    setColor(value: string): void {
        let rgbValues = hexToRgb(value);
        this.channels[this.redChannel-1].value = rgbValues['r'];
        this.channels[this.greenChannel-1].value = rgbValues['g'];
        this.channels[this.blueChannel-1].value = rgbValues['b'];

     }       
}

export class Channel {
    public value : number;

    constructor() {
        this.value = 0;
    }
}

export function initialize() {
    dmxController = new DMX();

    if (dmxController) {
        // TO DO: make the set up of the DMX USB more dynamic so different ports & devices can be used
        //universe = dmxController.addUniverse(universeName, 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
        dmxController.addUniverse(universeName, 'dmxking-ultra-dmx-pro', '/dev/ttyUSB0');
        //const universe = dmx.addUniverse(universeName, 'null');
        log("initialized dmx universe");
    } else {
        log("unable to initialize dmx universe");
    }
    return;
}

/*
/* Method to create new DMX fixture
 * The order that the fixtures are declared needs to match the way
 * the rig is physically wired. This will change once we add support
 * for the layout editor extension
 */
export function createFixture(numChannels: number) : Fixture {
    log("Creating dmx fixture");
    let fixture = new Fixture(numChannels)
    allFixtures.push(fixture);
    return fixture;
}

/* Method to create new Prefab DMX fixture
 * The order that the fixtures are declared needs to match the way
 * the rig is physically wired. This will change once we add support
 * for the layout editor extension
 */
export function createRGBFixture(fixtureType: RGBFixtureType) : RGBFixture {
    let fixtureTypeName : string = "";
    switch (fixtureType) {
        case RGBFixtureType.Baisun8ch:
            fixtureTypeName = "Baisun8ch";
            break;
        case RGBFixtureType.Coidak8ch:
            fixtureTypeName = "Coidak8ch";
            break;
        default:
            fixtureTypeName = "";
    }
    let rgbFixture = new RGBFixture(8, fixtureTypeName);
    allFixtures.push(rgbFixture);
    return rgbFixture;
}


/* Send the updated channel information to the DMX controller */
export function send() : void {
    log("Sending updated dmx info to controller");
    dmxController.update(universeName, generateDMXJson());
}

export function generateDMXJson() : any {
    let dmxChannels : any = {};
    let channelCount = 1;
    for (let i = 0; i < allFixtures.length; i++) {
        let fixture = allFixtures[i];
        for (let j = 0; j < fixture.numChannels; j++) {
            let index : number = channelCount + j;
            dmxChannels[index as number] = fixture.channels[j].value;
        }
        channelCount += fixture.numChannels;
    }
    log(dmxChannels);
    return dmxChannels;
}

export function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }


/* Eventually the rig editor will generate blocks like
 * "show scene", "play pattern", "loop pattern", "stop pattern"
 * scenes -> patterns -> shows (the user can do all 3 in makecode or
 * just do the actual triggering mechanisms therefore creating a show)
 */