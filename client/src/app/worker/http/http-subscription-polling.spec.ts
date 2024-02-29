import fetchMock from 'fetch-mock';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionPolling, POLLING_INTERVAL } from './http-subscription-polling';

function getHttpSubscriptionPollingInstance(url = `/`, onData = () => {}) {
    const endpointConfig: HttpSubscriptionEndpoint = {
        url,
        method: HttpMethod.POST
    };
    const handlerConfig = {
        onData
    };

    return new HttpSubscriptionPolling(endpointConfig, handlerConfig);
}

function getResponseBody(data = ``, hash = `0`) {
    const fd = new FormData();
    fd.append(`data`, data);
    fd.append(`hash`, hash);
    return new Response(fd);
}

describe(`http subscription polling`, () => {
    beforeEach(() => {
        fetchMock.mock(`end:/instant-forever?longpolling=1`, getResponseBody(`instant-forever`));
    });

    afterEach(() => fetchMock.reset());

    it(`initializes inactive`, () => {
        expect(getHttpSubscriptionPollingInstance().active).toBeFalse();
        expect(fetchMock.called(`/once-instant?longpolling=1`)).toBeFalse();
    });

    it(`receives data once`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`, () => resolver());
        subscr.start();
        await receivedData;
        expect(subscr.active).toBeTrue();
        await subscr.stop();
    });

    describe(`stopping`, () => {
        it(`stop while waiting for data`, async () => {
            jasmine.clock().install();
            fetchMock.mock(`end:/once-instant?longpolling=1`, getResponseBody(`once-instant`));
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/once-instant`, () => resolver());
            const start = subscr.start();
            await receivedData;
            fetchMock.mock(`end:/once-instant?longpolling=1`, getResponseBody(`once-instant`), {
                delay: 10000,
                overwriteRoutes: true
            });
            jasmine.clock().tick(POLLING_INTERVAL + 600);
            await subscr.stop();
            await expectAsync(start).toBeResolved();
        });

        it(`stop after data received`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });

        it(`instant stop`, async () => {
            const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`);
            const start = subscr.start();
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });
    });
});

