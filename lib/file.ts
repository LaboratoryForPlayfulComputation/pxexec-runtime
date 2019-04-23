import { readFile } from "fs";

export class FileBuffer {
    private _data: Buffer;
    constructor(data: Buffer) {
        this._data = data;
    }

    get data(): Buffer {
        return this._data;
    }

    static fromFile(name: string): Promise<FileBuffer> {
        return new Promise((resolve, reject) => {
            readFile(name, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new FileBuffer(data));
                }
            })
        });
    }
}