import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpStream } from './http-stream';
import { HttpSubscription } from './http-subscription';

class MockSubsciption extends HttpSubscription {
    private resolver: any;

    public setActive(active: boolean) {
        this._active = active;
    }

    public sendData(data: any) {
        this.callbacks.onData(data);
    }

    public sendError(data: any) {
        this.callbacks.onError(data);
    }

    public start(): Promise<void> {
        return new Promise(r => {
            this.resolver = r;
        });
    }

    public async stop(): Promise<void> {
        if (this.resolver) {
            this.resolver();
        }
    }

    public async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }
}

class SimpleHttpStream extends HttpStream {
    constructor(
        queryParams: URLSearchParams,
        endpoint: AutoupdateSetEndpointParams,
        authToken: string,
        requestPayload?: string,
        subscription?: HttpSubscription
    ) {
        super(queryParams, endpoint, authToken, requestPayload);

        if (subscription) {
            this.subscription = subscription;
        }
    }

    protected onData(_data: unknown): void {}

    protected onError(_error: unknown): void {}
}

describe(`http stream`, () => {
    let _httpStream: HttpStream;
    let subscription: MockSubsciption;

    beforeEach(() => {
        const endpoint = {
            url: ``,
            method: HttpMethod.POST,
            healthUrl: `/health`
        };
        subscription = new MockSubsciption(endpoint, {});
        _httpStream = new SimpleHttpStream(null, endpoint, ``, null, subscription);
    });

    xit(`receives data`, () => {});

    xit(`receives error`, () => {});

    xit(`increases failed counter`, () => {});

    xit(`resets failed counter on data`, () => {});

    xit(`parses data`, () => {});

    xit(`restart with open connection`, () => {});

    xit(`restart before open connection`, () => {});

    xdescribe(`receives stop reasons`, () => {
        it(`error`, () => {});

        it(`abort`, () => {});

        it(`abort`, () => {});

        it(`resolve with last error`, () => {});

        it(`resolve without error`, () => {});
    });
});
