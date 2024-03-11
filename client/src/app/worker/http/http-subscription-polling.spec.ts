import fetchMock from 'fetch-mock';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionPolling, POLLING_INTERVAL } from './http-subscription-polling';
import { ErrorDescription, ErrorType } from './stream-utils';

function getHttpSubscriptionPollingInstance(url = `/`, onData: any = () => {}, onError: any = undefined) {
    const endpointConfig: HttpSubscriptionEndpoint = {
        url,
        method: HttpMethod.POST
    };
    const handlerConfig = {
        onData,
        onError
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
        jasmine.clock().install();
        fetchMock.mock(`end:/instant-forever?longpolling=1`, getResponseBody(`instant-forever`));
        fetchMock.mock(`end:/error400-expected-format?longpolling=1`, {
            status: 400,
            headers: { 'Content-Type': `application/json` },
            body: JSON.stringify({
                error: { type: `mock-error`, msg: `Example error` }
            })
        });
    });

    afterEach(() => {
        fetchMock.reset();
        jasmine.clock().uninstall();
    });

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

    it(`receives error in onError`, async () => {
        let dataResolver: CallableFunction;
        let errorResolver: CallableFunction;
        const receivedData = new Promise(resolve => (dataResolver = resolve));
        const receivedError = new Promise(resolve => (errorResolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(
            `/error400-expected-format`,
            (d: any) => dataResolver(d),
            (d: any) => errorResolver(d)
        );
        subscr.start();
        await expectAsync(receivedError).toBeResolved();
        expectAsync(receivedData).toBePending();
        expect((<ErrorDescription>await receivedError)?.type).toEqual(ErrorType.CLIENT);
        expect((<ErrorDescription>await receivedError)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    it(`receives error in onData`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(`/error400-expected-format`, (d: any) => resolver(d));
        subscr.start();
        await expectAsync(receivedData).toBeResolved();
        expect((<ErrorDescription>await receivedData)?.type).toEqual(ErrorType.CLIENT);
        expect((<ErrorDescription>await receivedData)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    describe(`stopping`, () => {
        it(`stop while waiting for data`, async () => {
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

        it(`stops on server error`, async () => {
            fetchMock.mock(`end:/error502?longpolling=1`, {
                status: 502,
                body: `Bad gateway`
            });
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/error502`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((<ErrorDescription>data)?.type).toEqual(ErrorType.SERVER);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });

        it(`stops on client error`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/error400-expected-format`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((<ErrorDescription>data)?.type).toEqual(ErrorType.CLIENT);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });
    });
});
