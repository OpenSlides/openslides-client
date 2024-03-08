import { Id } from 'src/app/domain/definitions/key-types';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { WorkerHttpAuth } from '../http/auth';
import { ICCStream } from './icc-stream';

export class ICCStreamPool {
    private broadcast: (s: string, a: string, c?: any) => void = () => {};

    constructor(private endpoint: AutoupdateSetEndpointParams) {}

    public async openNewStream(_ctx: any, config: { type: string; meetingId: Id }): Promise<ICCStream> {
        const params = new URLSearchParams([[`meeting_id`, config.meetingId.toString()]]);
        const stream = new ICCStream(
            params,
            {
                ...this.endpoint,
                url: this.endpoint.url + `/${config.type}`
            },
            await WorkerHttpAuth.currentToken()
        );
        stream.start();

        return stream;
    }

    public registerBroadcast(broadcast: (s: string, a: string, c?: any) => void): void {
        this.broadcast = broadcast;
    }

    private sendToAll(action: string, content?: any): void {
        this.broadcast(`autoupdate`, action, content);
    }
}
