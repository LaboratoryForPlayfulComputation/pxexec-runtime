
declare module 'dmx' {
    class DMX {
        constructor();
        public registerDriver(name: string, module: string): void;
        public addUniverse(name: string, driver: string, deviceId?: string, options?: any): void;
        public update(universe: string, channels: Object): void;
        public updateAll(universe: string, value: number): void;
        public universeToObject(universeKey: string): Object;
    }      
    export = DMX;
}