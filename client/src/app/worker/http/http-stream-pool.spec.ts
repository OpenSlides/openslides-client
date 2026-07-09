import fetchMock from 'fetch-mock';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpStream } from './http-stream';
import { HttpStreamPool } from './http-stream-pool';
import { HttpSubscription } from './http-subscription';

export class MockHttpStream extends HttpStream {
    public constructor(
        queryParams: URLSearchParams,
        endpoint: AutoupdateSetEndpointParams,
        authToken: string,
        requestPayload?: string
    ) {
        super(queryParams, endpoint, authToken, requestPayload);
    }

    public getSubscription(): HttpSubscription {
        return this.subscription as HttpSubscription;
    }

    public onData(_data: unknown): void {}

    public onError(_error: unknown): void {}
}

class SimpleHttpStreamPool extends HttpStreamPool<MockHttpStream> {
    protected messageSenderName = `simple`;

    protected connectStream(_stream: MockHttpStream, _force?: boolean): Promise<void> {
        throw new Error(`Method not implemented.`);
    }
}

describe(`http stream pool`, () => {
    let httpStreamPool: SimpleHttpStreamPool;

    beforeEach(() => {
        const endpoint = {
            url: ``,
            method: HttpMethod.POST,
            healthUrl: `/health`
        };
        httpStreamPool = new SimpleHttpStreamPool(endpoint);
    });

    it.skip(`returns active streams`, () => {});

    it.skip(`reconnects stream on online status`, () => {});

    it.skip(`stops stream on offline status`, () => {});

    it.skip(`reconnect all streams`, () => {});

    it.skip(`reconnects single stream`, () => {});

    it.skip(`error on reconnect unknown stream`, () => {});

    it.skip(`removes stream`, () => {});

    it.skip(`sends broadcast to specified function`, () => {});

    describe(`healthchecks`, () => {
        let healthy = false;

        beforeEach(() => {
            healthy = false;
            fetchMock.mockGlobal();
            fetchMock.route(
                `end:/health`,
                () => {
                    const body = JSON.stringify({
                        healthy
                    });

                    return {
                        headers: { 'Content-Type': `application/json` },
                        body
                    };
                },
                {
                    name: `health`
                }
            );
        });

        afterEach(() => fetchMock.hardReset());

        it(`recognizes healty service`, async () => {
            healthy = true;
            await expect(httpStreamPool.isEndpointHealthy()).resolves.toEqual(true);
        });

        it(`recognizes unhealty service`, async () => {
            healthy = false;
            await expect(httpStreamPool.isEndpointHealthy()).resolves.toEqual(false);
        });

        it(`can handle broken health endpoint`, async () => {
            fetchMock.modifyRoute(`health`, {
                response: {
                    status: 500
                }
            });

            await expect(httpStreamPool.isEndpointHealthy()).resolves.toEqual(false);
        });

        it(`wait healthy instantly`, async () => {
            healthy = true;
            await expect(httpStreamPool.waitUntilEndpointHealthy()).resolves.toEqual(false);
        });
    });
});
