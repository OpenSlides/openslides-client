import fetchMock, { MockRequest } from 'fetch-mock';
import { ErrorDescription, ErrorType } from 'src/app/gateways/http-stream/stream-utils';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionSSE } from './http-subscription-sse';

function getHttpSubscriptionSSEInstance(url = `/`, onData: any = () => {}, onError: any = undefined) {
    const endpointConfig: HttpSubscriptionEndpoint = {
        url,
        method: HttpMethod.POST
    };
    const handlerConfig = {
        onData,
        onError
    };

    return new HttpSubscriptionSSE(endpointConfig, handlerConfig);
}

function getValidStream(req: MockRequest, interval: number, resolveAfter = -1) {
    let cnt = 0;
    let abort = false;
    const textEncoder = new TextEncoder();
    const stream = new ReadableStream({
        async pull(controller) {
            controller.enqueue(textEncoder.encode(`resp:${cnt}\n`));

            cnt++;
            if (cnt >= resolveAfter && resolveAfter >= 0) {
                controller.close();
            } else if (abort) {
                const err = new Error(`AbortError`);
                err.name = `AbortError`;
                controller.error(err);
            }

            await new Promise(r => setTimeout(r, interval));
        }
    });
    req.signal.addEventListener(`abort`, () => {
        abort = true;
    });

    return new Response(stream);
}

describe(`http subscription polling`, () => {
    beforeEach(() => {
        fetchMock.mock(`end:/does-not-resolve`, (_, opts) => getValidStream(opts, 100));
        fetchMock.mock(`end:/error400-expected-format`, {
            status: 400,
            headers: { 'Content-Type': `application/json` },
            body: JSON.stringify({
                error: { type: `ClientError`, msg: `Example error` }
            })
        });
    });

    afterEach(() => fetchMock.reset());

    it(`initializes inactive`, () => {
        expect(getHttpSubscriptionSSEInstance(`/does-not-resolve`).active).toBeFalse();
        expect(fetchMock.called(`/does-not-resolve`)).toBeFalse();
    });

    it(`receives data once`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionSSEInstance(`/does-not-resolve`, (d: any) => resolver(d));
        subscr.start();
        const data = await receivedData;
        expect(data).toEqual(`resp:0\n`);
        expect(subscr.active).toBeTrue();
        await subscr.stop();
    });

    it(`receives error in onError`, async () => {
        let dataResolver: CallableFunction;
        let errorResolver: CallableFunction;
        const receivedData = new Promise(resolve => (dataResolver = resolve));
        const receivedError = new Promise(resolve => (errorResolver = resolve));
        const subscr = getHttpSubscriptionSSEInstance(
            `/error400-expected-format`,
            (d: any) => dataResolver(d),
            (d: any) => errorResolver(d)
        );
        subscr.start();
        await expectAsync(receivedError).toBeResolved();
        expectAsync(receivedData).toBePending();
        expect((<ErrorDescription>await receivedError)?.type).toEqual(ErrorType.CLIENT);
        await subscr.stop();
    });

    it(`receives error in onData`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionSSEInstance(`/error400-expected-format`, (d: any) => resolver(d));
        subscr.start();
        await expectAsync(receivedData).toBeResolved();
        expect((<ErrorDescription>await receivedData)?.type).toEqual(ErrorType.CLIENT);
        await subscr.stop();
    });

    describe(`stopping`, () => {
        it(`stop after resolve`, async () => {
            fetchMock.mock(`end:/resolves`, (_, opts) => getValidStream(opts, 100, 2));

            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/resolves`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await expectAsync(start).toBeResolved();
            expect(subscr.active).toBeFalsy();
        });

        it(`stop after data received`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/does-not-resolve`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });

        it(`instant stop`, async () => {
            const subscr = getHttpSubscriptionSSEInstance(`/does-not-resolve`);
            const start = subscr.start();
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });

        it(`stops on server error`, async () => {
            fetchMock.mock(`end:/error502`, {
                status: 502,
                body: `Bad gateway`
            });
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/error502`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((<ErrorDescription>data)?.type).toEqual(ErrorType.SERVER);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });

        it(`stops on client error`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/error400-expected-format`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((<ErrorDescription>data)?.type).toEqual(ErrorType.CLIENT);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });
    });
});
