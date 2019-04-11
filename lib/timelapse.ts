import * as request from 'request';

import * as core from './core-exec';
import { Image } from './webcam';

let url: string;

core.onInit(() => {
    url = core.env["TIMELAPSE_URL"];
})

export function uploadImage(image: Image): void {
    core._await(new Promise((resolve, reject) => {
        const req = request.post(url, (err, resp, _body) => {
            if (err) {
                reject(err);
            } else {
                if (resp.statusCode !== 200) {
                    reject(resp.statusMessage);
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