import * as request from 'request';

import * as core from './core-exec';
import { Image } from './webcam';

let url: string;

core.onInit(() => {
    url = core.env["TIMELAPSE_URL"];
})

function formatError(resp : request.Response) : string {
    switch (resp.statusCode) {
        case 429: // Too Many Requests
            return "The server is too busy (are you sending pictures too quickly?)";
        case 403: // Forbidden
            return "The server said we can't send a picture (did you set up a password?)";
        case 404: // Not Found
            return "The server couldn't find our machine id (have you registered on the timelapse website?)";
        case 500: // Internal Server Error
            return "The server encountered a problem and had to give up:" + resp.body;
    }
}

export function uploadImage(image: Image): void {
    core._await(new Promise((resolve, reject) => {
        const req = request.post(url, (err, resp, _body) => {
            if (err) {
                reject("Could not contact the timelapse server: " + err);
            } else {
                if (resp.statusCode !== 200) {
                    reject(formatError(resp));
                } else {
                    resolve()
                }
            }
        });
        const form = req.form();
        form.append('machineId', core.machineID);
        form.append('image', image.stream());
    }));
}