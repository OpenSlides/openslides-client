import { Id } from 'src/app/domain/definitions/key-types';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpStream } from '../http/http-stream';

export class ICCStream extends HttpStream {
    private users = 1;

    constructor(
        private dataCb: (data: any) => void,
        public config: { type: string; meetingId: Id },
        endpoint: AutoupdateSetEndpointParams,
        authToken: string
    ) {
        const params = new URLSearchParams([[`meeting_id`, config.meetingId.toString()]]);
        super(params, endpoint, authToken);
    }

    public override async start(
        force?: boolean
    ): Promise<{ stopReason: 'error' | 'aborted' | 'resolved' | 'in-use' | string; error?: any }> {
        if (!this.users) {
            return { stopReason: `unused` };
        }

        const stopInfo = await super.start(force);
        if (stopInfo.stopReason === `aborted` && !this.users) {
            stopInfo.stopReason = `unused`;
        }

        return stopInfo;
    }

    public addUser(): void {
        this.users++;
    }

    public removeUser(): void {
        this.users--;
        if (this.users === 0) {
            this.abort();
        }
    }

    protected onData(data: string): void {
        this.dataCb(JSON.parse(data));
    }

    protected onError(_error: unknown): void {}
}
