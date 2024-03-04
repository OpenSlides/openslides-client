import fetchMock, { MockRequest } from 'fetch-mock';
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

fdescribe(`http subscription polling`, () => {
    beforeEach(() => {
        fetchMock.mock(`end:/does-not-resolve`, (_, opts) => getValidStream(opts, 100));
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

    xit(`receives error in onError`, async () => {});

    xit(`receives error in onData`, async () => {});

    xdescribe(`stopping`, () => {
        it(`stop while waiting for data`, async () => {});

        it(`stop after data received`, async () => {});

        it(`instant stop`, async () => {});

        it(`stops on server error`, async () => {});

        it(`stops on client error`, async () => {});
    });
});
