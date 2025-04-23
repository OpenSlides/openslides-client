import fetchMock from 'fetch-mock';
import { NormalizedRequestOptions } from 'fetch-mock/dist/esm/RequestUtils';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

import { HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionSSE } from './http-subscription-sse';
import { ErrorDescription, ErrorType } from './stream-utils';

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

function getValidStream(req: NormalizedRequestOptions, interval: number, resolveAfter = -1) {
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

// TODO: https://github.com/wheresrhys/fetch-mock/issues/845
xdescribe(`http subscription polling`, () => {
    beforeEach(() => {
        fetchMock.mockGlobal();
        fetchMock.route(`end:/does-not-resolve`, args => getValidStream(args.options, 100));
        fetchMock.route(`end:/error400-expected-format`, {
            status: 400,
            headers: { 'Content-Type': `application/json` },
            body:
                JSON.stringify({
                    error: { type: `mock-error`, msg: `Example error` }
                }) + `\n`
        });
    });

    afterEach(() => fetchMock.hardReset());

    it(`initializes inactive`, () => {
        expect(getHttpSubscriptionSSEInstance(`/does-not-resolve`).active).toBeFalse();
        expect(fetchMock.callHistory.called(`/does-not-resolve`)).toBeFalse();
    });

    // TODO: https://github.com/wheresrhys/fetch-mock/issues/845
    xit(`receives data once`, async () => {
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
        expect((await receivedError as ErrorDescription)?.type).toEqual(ErrorType.CLIENT);
        expect((await receivedError as ErrorDescription)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    it(`receives error in onData`, async () => {
        let resolver: CallableFunction;
        const receivedData = new Promise(resolve => (resolver = resolve));
        const subscr = getHttpSubscriptionSSEInstance(`/error400-expected-format`, (d: any) => resolver(d));
        subscr.start();
        await expectAsync(receivedData).toBeResolved();
        expect((await receivedData as ErrorDescription)?.type).toEqual(ErrorType.CLIENT);
        expect((await receivedData as ErrorDescription)?.error?.type).toEqual(`mock-error`);
        await subscr.stop();
    });

    describe(`stopping`, () => {
        it(`stop after resolve`, async () => {
            fetchMock.route(`end:/resolves`, args => getValidStream(args.options, 100, 2));

            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/resolves`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await expectAsync(start).toBeResolved();
            expect(subscr.active).toBeFalsy();
        });

        // TODO: https://github.com/wheresrhys/fetch-mock/issues/845
        xit(`stop after data received`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/does-not-resolve`, () => resolver());
            const start = subscr.start();
            await receivedData;
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });

        // TODO: https://github.com/wheresrhys/fetch-mock/issues/845
        xit(`instant stop`, async () => {
            const subscr = getHttpSubscriptionSSEInstance(`/does-not-resolve`);
            const start = subscr.start();
            await subscr.stop();
            return expectAsync(start).toBeResolved();
        });

        it(`stops on server error`, async () => {
            fetchMock.route(`end:/error502`, {
                status: 502,
                body: `Bad gateway`
            });
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/error502`, (d: any) => resolver(d));
            subscr.start();
            const data = await receivedData;
            expect((data as ErrorDescription)?.type).toEqual(ErrorType.SERVER);
            expect(subscr.active).toBeFalsy();
            await subscr.stop();
        });

        it(`stops on client error`, async () => {
            let resolver: CallableFunction;
            const receivedData = new Promise(resolve => (resolver = resolve));
            const subscr = getHttpSubscriptionSSEInstance(`/error400-expected-format`, (d: any) => resolver(d));
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
            const subscr = getHttpSubscriptionSSEInstance(`/throws`);
            try {
                await subscr.start();
            } catch (e) {}
            expect(subscr.active).toBeFalsy();
        });
    });
});
