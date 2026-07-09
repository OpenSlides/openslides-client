import fetchMock from 'fetch-mock';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionPolling, POLLING_INTERVAL } from './http-subscription-polling';
import { ErrorDescription, ErrorType } from './stream-utils';

function getHttpSubscriptionPollingInstance(url = `/`, onData: any = () => {}, onError: any = undefined) {
    const endpointConfig: HttpSubscriptionEndpoint = {
        url,
        method: HttpMethod.POST,
        authToken: `foo`
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
        vi.useFakeTimers();
        fetchMock.mockGlobal();
        fetchMock.route(`end:/instant-forever?longpolling=1`, getResponseBody(`instant-forever`));
        fetchMock.route(`end:/error400-expected-format?longpolling=1`, {
            status: 400,
            headers: { 'Content-Type': `application/json` },
            body: JSON.stringify({
                error: { type: `mock-error`, msg: `Example error` }
            })
        });
    });

    afterEach(() => {
        fetchMock.hardReset();
        vi.useRealTimers();
    });

    it(`initializes inactive`, () => {
        expect(getHttpSubscriptionPollingInstance().active).toBe(false);
        expect(fetchMock.callHistory.called(`/once-instant?longpolling=1`)).toBe(false);
    });

    it(`receives data once`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`, () => resolver());
        subscr.start();
        await receivedData;
        expect(subscr.active).toBe(true);
        await subscr.stop();
    });

    it(`receives data twice`, async () => {
        let resolver: CallableFunction;
        let receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`, () => resolver());
        subscr.start();
        await expect(receivedData).resolves.not.toThrow();
        receivedData = new Promise(resolve => (resolver = resolve));
        vi.advanceTimersByTime(POLLING_INTERVAL + 200);
        await expect(receivedData).resolves.not.toThrow();
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
        await expect(receivedError).resolves.not.toThrow();
        // TODO: vitest-migration: Unsupported matcher ".toBePending()" found. Vitest does not have a direct equivalent. Please migrate this manually, for example by using `Promise.race` to check if the promise settles within a short timeout.
        expectAsync(receivedData).toBePending();
        expect(((await receivedError) as ErrorDescription)?.type).toEqual(ErrorType.CLIENT);
        expect(((await receivedError) as ErrorDescription)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    it(`receives error in onData`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionPollingInstance(`/error400-expected-format`, (d: any) => resolver(d));
        subscr.start();
        await expect(receivedData).resolves.not.toThrow();
        expect(((await receivedData) as ErrorDescription)?.type).toEqual(ErrorType.CLIENT);
        expect(((await receivedData) as ErrorDescription)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    describe(`stopping`, () => {
        it(`stop while waiting for data`, async () => {
            fetchMock.route(`end:/once-instant?longpolling=1`, getResponseBody(`once-instant`), {
                name: `once-instant-longpolling`
            });
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/once-instant`, () => resolver());
            const start = subscr.start();
            await receivedData;
            fetchMock.modifyRoute(`once-instant-longpolling`, {
                delay: 10000,
                response: getResponseBody(`once-instant`)
            });
            vi.advanceTimersByTime(POLLING_INTERVAL + 600);
            await subscr.stop();
            await expect(start).resolves.not.toThrow();
        });

        it(`stop after data received`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await subscr.stop();
            return expect(start).resolves.not.toThrow();
        });

        it(`instant stop`, async () => {
            const subscr = getHttpSubscriptionPollingInstance(`/instant-forever`);
            const start = subscr.start();
            await subscr.stop();
            return expect(start).resolves.not.toThrow();
        });

        it(`stops on server error`, async () => {
            fetchMock.route(`end:/error502?longpolling=1`, {
                status: 502,
                body: `Bad gateway`
            });
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/error502`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((data as ErrorDescription)?.type).toEqual(ErrorType.SERVER);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });

        it(`stops on client error`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionPollingInstance(`/error400-expected-format`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((data as ErrorDescription)?.type).toEqual(ErrorType.CLIENT);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });

        it(`stops on fetch error`, async () => {
            fetchMock.route(`end:/throws`, {
                status: 502,
                body: `Bad gateway`,
                throws: new Error(`fetch error`)
            });
            const subscr = getHttpSubscriptionPollingInstance(`/throws?longpolling=1`);
            try {
                await subscr.start();
            } catch (e) {}
            expect(subscr.active).toBeFalsy();
        });
    });
});
