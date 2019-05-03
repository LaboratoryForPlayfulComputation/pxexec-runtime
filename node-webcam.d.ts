declare module 'node-webcam' {
    type WebcamOptions = Partial<{
        width: number,
        height: number,

        delay: number,
        quality: number,

        output: "jpeg" | "png",
        device: Webcam | false,

        callbackReturn: "location" | "buffer" | "base64",
        verbose: boolean
    }>;

    interface Factory {
        (): void,
        create(options: WebcamOptions, type: NodeJS.Platform): Webcam,
        Platform: string,
    }

    class Webcam {
        constructor(options: Partial<WebcamOptions>);
        create(options: WebcamOptions, type: NodeJS.Platform): Webcam;
        Platform: string;

        clone(): Webcam;
        clear(): void;
        capture(location: string | undefined, cb: (err: string | undefined, image: string | Buffer) => void): void;
    }

    class NodeWebcam {
        version: string;
        REVISION: number;
        Factory: Webcam;
        Webcam: Webcam;
        static create(options: WebcamOptions): Webcam;
        static capture(location: string, options: WebcamOptions, callback: (err: string | string[], data: string | Buffer) => void): void
    }
    export = NodeWebcam;
}