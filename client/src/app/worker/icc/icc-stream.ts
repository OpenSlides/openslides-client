import { HttpStream } from '../http/http-stream';

export class ICCStream extends HttpStream {
    protected onData(_data: unknown): void {
        throw new Error(`Method not implemented.`);
    }

    protected onError(_error: unknown): void {
        throw new Error(`Method not implemented.`);
    }
}
