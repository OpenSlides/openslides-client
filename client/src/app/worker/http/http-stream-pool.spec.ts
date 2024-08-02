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

    xit(`returns active streams`, () => {});

    xit(`reconnects stream on online status`, () => {});

    xit(`stops stream on offline status`, () => {});

    xit(`reconnect all streams`, () => {});

    xit(`reconnects single stream`, () => {});

    xit(`error on reconnect unknown stream`, () => {});

    xit(`removes stream`, () => {});

    xit(`sends broadcast to specified function`, () => {});

    describe(`healthchecks`, () => {
        let healthy = false;

        beforeEach(() => {
            healthy = false;
            fetchMock.mock(`end:/health`, () => {
                const body = JSON.stringify({
                    healthy
                });

                return {
                    headers: { 'Content-Type': `application/json` },
                    body
                };
            });
        });

        afterEach(() => fetchMock.reset());

        it(`recognizes healty service`, async () => {
            healthy = true;
            await expectAsync(httpStreamPool.isEndpointHealthy()).toBeResolvedTo(true);
        });

        it(`recognizes unhealty service`, async () => {
            healthy = false;
            await expectAsync(httpStreamPool.isEndpointHealthy()).toBeResolvedTo(false);
        });

        it(`can handle broken health endpoint`, async () => {
            fetchMock.mock(
                `end:/health`,
                {
                    status: 500
                },
                { overwriteRoutes: true }
            );

            await expectAsync(httpStreamPool.isEndpointHealthy()).toBeResolvedTo(false);
        });

        it(`wait healthy instantly`, async () => {
            healthy = true;
            await expectAsync(httpStreamPool.waitUntilEndpointHealthy()).toBeResolvedTo(false);
        });
    });
});
