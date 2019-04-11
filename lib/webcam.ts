import NodeWebcam = require('node-webcam');

import * as fs from 'fs';

import * as core from './core-exec';
import * as console from './console';

let camera: NodeWebcam["Webcam"] | undefined = undefined;

core.onInit(() => {
    camera = NodeWebcam.create({
        callbackReturn: "location",
        output: "png",
    });
});

export class Image {
    private filename: string;
    constructor(file: string) {
        this.filename = file;
    }

    stream(): fs.ReadStream {
        return fs.createReadStream(this.filename);
    }
};

export function capture(): Image {
    return core._await(new Promise((resolve, reject) => {
        camera.capture('/tmp/pxt-runtime-shot', (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log("Took a webcam shot.")
                resolve(new Image(data as string));
            }
        });
    }));
}