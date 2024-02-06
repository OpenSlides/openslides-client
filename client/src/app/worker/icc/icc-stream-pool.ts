import { Id } from 'src/app/domain/definitions/key-types';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { WorkerHttpAuth } from '../http/auth';
import { ICCStream } from './icc-stream';

export class ICCStreamPool {
    constructor(private endpoint: AutoupdateSetEndpointParams) {}

    public async openNewStream(config: { type: string; meetingId: Id }): Promise<ICCStream> {
        const params = new URLSearchParams([[`meeting_id`, config.meetingId.toString()]]);
        const stream = new ICCStream(
            params,
            {
                ...this.endpoint,
                url: this.endpoint.url + `/${config.type}`
            },
            await WorkerHttpAuth.currentToken()
        );

        return stream;
    }
}
