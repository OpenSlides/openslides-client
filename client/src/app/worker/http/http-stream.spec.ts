import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpStream } from './http-stream';
import { HttpSubscription } from './http-subscription';
import { ErrorDescription, ErrorType } from './stream-utils';

class MockSubsciption extends HttpSubscription {
    private resolver: any;
    private rejector: any;

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
        return new Promise((res, rej) => {
            this.rejector = (e: unknown) => {
                rej(e);
                this._active = false;
            };

            this.resolver = () => {
                res();
                this._active = false;
            };
        });
    }

    public async stop(): Promise<void> {
        this.resolver();
    }

    public stopCustom(e?: any): void {
        if (e && this.rejector) {
            this.rejector(e);
        } else if (this.resolver) {
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

describe(`http stream`, () => {
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

    it(`restart`, async () => {
        const start = httpStream.start();
        await httpStream.restart();
        await expectAsync(start).toBePending();
    });

    it(`force start`, async () => {
        const start = httpStream.start();
        const forceStart = httpStream.start(true);
        await expectAsync(start).toBeResolvedTo({ stopReason: `aborted` });
        await expectAsync(forceStart).toBePending();
    });

    it(`passes subscription active`, async () => {
        subscription.setActive(true);
        expect(httpStream.active).toBeTrue();
    });

    it(`passes subscription inactive`, async () => {
        subscription.setActive(false);
        expect(httpStream.active).toBeFalse();
    });

    it(`resolves data received`, async () => {
        httpStream.start();
        await expectAsync(httpStream.receivedData).toBePending();
        subscription.sendData(`test-error`);
        await expectAsync(httpStream.receivedData).toBeResolved();
    });

    describe(`receives stop reasons`, () => {
        it(`error`, async () => {
            const start = httpStream.start();
            subscription.stopCustom(`test`);
            await expectAsync(start).toBeResolvedTo({ stopReason: `error`, error: null });
        });

        it(`abort`, async () => {
            const start = httpStream.start();
            await httpStream.abort();
            await expectAsync(start).toBeResolvedTo({ stopReason: `aborted` });
        });

        it(`abort with error`, async () => {
            const start = httpStream.start();
            const e = new Error();
            e.name = `AbortError`;
            subscription.stopCustom(e);
            await expectAsync(start).toBeResolvedTo({ stopReason: `aborted` });
        });

        it(`in-use`, async () => {
            const start = httpStream.start();
            await expectAsync(httpStream.start()).toBeResolvedTo({ stopReason: `in-use` });
            await expectAsync(start).toBePending();
        });

        it(`resolve with last error`, async () => {
            const start = httpStream.start();
            subscription.sendError(`test-error`);
            subscription.stopCustom();
            await expectAsync(start).toBeResolvedTo({ stopReason: `error`, error: `test-error` });
        });

        it(`clean resolve`, async () => {
            const start = httpStream.start();
            subscription.stopCustom();
            await expectAsync(start).toBeResolvedTo({ stopReason: `resolved` });
        });
    });
});
