import { ErrorDescription, ErrorType } from 'src/app/gateways/http-stream/stream-utils';
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
        this._active = true;
        return new Promise(r => {
            this.resolver = () => {
                r();
                this._active = false;
            };
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
        requestPayload?: string
    ) {
        super(queryParams, endpoint, authToken, requestPayload);

        this.subscription = new MockSubsciption(endpoint, {
            onData: (data: unknown) => this.handleContent(data),
            onError: (data: unknown) => this.handleError(data)
        });
    }

    public getSubscription(): MockSubsciption {
        return this.subscription as MockSubsciption;
    }

    public onData(_data: unknown): void {}

    public onError(_error: unknown): void {}
}

fdescribe(`http stream`, () => {
    let httpStream: SimpleHttpStream;
    let subscription: MockSubsciption;

    beforeEach(() => {
        const endpoint = {
            url: ``,
            method: HttpMethod.POST,
            healthUrl: `/health`
        };
        httpStream = new SimpleHttpStream(null, endpoint, ``, null);
        subscription = httpStream.getSubscription();
    });

    it(`receives data`, () => {
        spyOn(httpStream, `onData`);
        subscription.sendData(`test-data`);
        expect(httpStream.onData).toHaveBeenCalledWith(`test-data`);
    });

    it(`receives error`, () => {
        spyOn(httpStream, `onError`);
        subscription.sendError(`test-error`);
        expect(httpStream.onError).toHaveBeenCalledWith(`test-error`);
    });

    it(`receives error via data in onError`, () => {
        spyOn(httpStream, `onData`);
        spyOn(httpStream, `onError`);
        const error = new ErrorDescription(ErrorType.UNKNOWN, null, ``);
        subscription.sendData(error);
        expect(httpStream.onError).toHaveBeenCalledWith(error);
        expect(httpStream.onData).not.toHaveBeenCalled();
    });

    it(`increases failed counter via direct error`, () => {
        expect(httpStream.failedCounter).toEqual(0);
        subscription.sendError(`test-error`);
        expect(httpStream.failedCounter).toEqual(1);
    });

    it(`increases failed counter via onData error`, () => {
        expect(httpStream.failedCounter).toEqual(0);
        const error = new ErrorDescription(ErrorType.UNKNOWN, null, ``);
        subscription.sendData(error);
        expect(httpStream.failedCounter).toEqual(1);
    });

    it(`resets failed counter on data`, () => {
        subscription.sendError(`test-error`);
        subscription.sendData(`reset-failed`);
        expect(httpStream.failedCounter).toEqual(0);
    });

    xit(`restart with open connection`, () => {});

    xit(`restart before open connection`, () => {});

    xit(`force start`, async () => {
        const start = httpStream.start();
        const forceStart = httpStream.start(true);
        await expectAsync(start).toBeResolvedTo({ stopReason: `aborted` });
        await expectAsync(forceStart).toBePending();
    });

    describe(`receives stop reasons`, () => {
        xit(`error`, async () => {});

        xit(`abort`, async () => {});

        it(`in-use`, async () => {
            const start = httpStream.start();
            await expectAsync(httpStream.start()).toBeResolvedTo({ stopReason: `in-use` });
            await expectAsync(start).toBePending();
        });

        xit(`resolve with last error`, async () => {});

        xit(`resolve without error`, async () => {});
    });
});
