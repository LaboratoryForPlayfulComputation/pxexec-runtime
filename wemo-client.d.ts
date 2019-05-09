/**
 * Type definitions for wemo-client by William Temple
 */

interface WemoClientEvents {
    error(err: any): void;
    binaryState(value: string): void;
    statusChange(deviceId: string, capabilityid: string, value: string): void;
    attributeList(name: string, value: string, prevalue: string, timestamp: string): void;
    insightParams(binaryState: string, instantPower: string, data: any): void;
}

interface EndDeviceInfo {
    friendlyName: string,
    deviceId: string,
    capabilities: { [k: string]: string },
    deviceType: string
}

declare class WemoClient extends NodeJS.EventEmitter {
    getEndDevices(cb: (err: any, endDeviceInfos: Array<EndDeviceInfo>) => void): void;
    getBinaryState(cb: (err: any, state: "1" | "0") => void): void;
    setBinaryState(value: "1" | "0", cb?: (err: any, response: any) => void): void;
    getBrightness(cb: (err: any, brightness: number) => void): void;
    setBrightness(value: number, cb: (err: any, response: any) => void): void;
    getAttributes(cb: (err: any, attributes: any) => void) : void;
    getDeviceStatus(deviceId: string, cb: (err: any, deviceStatus: {[k: string] : string}) => void) : void;
    setDeviceStatus(deviceId: string, capability: string, value: string, cb: (err: any, response: any) => void) : void;
    setLightColor(deviceId: string, red: number, green: number, blue: number, cb: (err: any, reponse: any) =>  void) : void;
    getInsightParams(cb: (err: any, binaryState: string, instantPower: string, data: any) => void) : void;
    setAttributes(attributes: {[k: string] : string}, cb: (err: any, returnValue: any) => void) : void;

    static EventServices: {
        insightParams: 'urn:Belkin:service:insight:1',
        statusChange: 'urn:Belkin:service:bridge:1',
        attributeList: 'urn:Belkin:service:basicevent:1',
        binaryState: 'urn:Belkin:service:basicevent:1'
    }
}

interface IWemoDeviceInfo {
    deviceType: "urn:Belkin:device:controllee:1",
    friendlyName: string,
    manufacturer: string,
    manufacturerURL: string,
    modelDescription: string,
    modelName: string,
    modelNumber: string,
    hwVersion: string,
    modelURL: string,
    serialNumber: string,
    UDN: string,
    UPC: string,
    macAddress: string,
    hkSetupCode: string,
    firmwareVersion: string,
    iconVersion: string,
    binaryState: string, // ?????
    iconList: {
        icon: {
            mimetype: string,
            width: string,
            height: string,
            depth: string,
            url: string
        }
    },
    serviceList: {
        service: Array<{
            serviceType: string,
            serviceId: string,
            controlURL: string,
            eventSubURL: string,
            SCPDURL: string
        }>
    },
    presentationURL: string,
    host: string,
    port: string,
    callbackURL: string,
}

type DeviceType =
    'urn:Belkin:device:bridge:1'
    | 'urn:Belkin:device:controllee:1'
    | 'urn:Belkin:device:sensor:1'
    | 'urn:Belkin:device:Maker:1'
    | 'urn:Belkin:device:insight:1'
    | 'urn:Belkin:device:lightswitch:1'
    | 'urn:Belkin:device:dimmer:1'
    | 'urn:Belkin:device:Humidifier:1'
    | 'urn:Belkin:device:HeaterB:1';

type ServiceType =
    'urn:Belkin:service:insight:1'
    | 'urn:Belkin:service:bridge:1'
    | 'urn:Belkin:service:basicevent:1'
    | 'urn:Belkin:service:basicevent:1';

declare module "wemo-client" {
    export = Wemo;

    import StrictEventEmitter from 'strict-event-emitter-types';

    class Wemo {
        constructor(opts?: {
            port?: number,
            discover_opts?: {
                unicastBindPort: number
            },
            listen_interface?: string
        });

        client(device: IWemoDeviceInfo): StrictEventEmitter<WemoClient, WemoClientEvents>;
        discover(cb: (err: any, info: IWemoDeviceInfo) => void): void;
        load(setupUrl: string, cb: (err: any, info: IWemoDeviceInfo) => void): void;

        static DEVICE_TYPE: {
            Bridge: 'urn:Belkin:device:bridge:1',
            Switch: 'urn:Belkin:device:controllee:1',
            Motion: 'urn:Belkin:device:sensor:1',
            Maker: 'urn:Belkin:device:Maker:1',
            Insight: 'urn:Belkin:device:insight:1',
            LightSwitch: 'urn:Belkin:device:lightswitch:1',
            Dimmer: 'urn:Belkin:device:dimmer:1',
            Humidifier: 'urn:Belkin:device:Humidifier:1',
            HeaterB: 'urn:Belkin:device:HeaterB:1'
        };
    }

}