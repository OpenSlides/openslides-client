import fetchMock from 'fetch-mock';
import { environment } from 'src/environments/environment';

import { WorkerHttpAuth } from './auth';

const AUTH_TOKENS = {
    VALID_TILL_120_UID_1: `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsImV4cCI6MTIwfQ.P5Q6ZNWrSDSUK2yxm84mKCsBxsuuJSmMIokbmRuVT00`,
    VALID_TILL_59_UID_2: `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsImV4cCI6NTl9.YVtUyO9TGg7JM47MIECmQzp7-u3LYMtDp-Z0f9xZzQ0`
};

const ANON_BODY = JSON.stringify({ message: `anonymous`, success: true, userId: 0, sessionId: `0` });
const AUTH_BODY = JSON.stringify({ message: `Action handled successfully`, success: true });
const FAIL_BODY = JSON.stringify({ message: `Not signed in`, success: false });

describe(`shared worker auth singleton`, () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(0));
        fetchMock.mockGlobal();
        WorkerHttpAuth.reset();
    });

    afterEach(() => {
        vi.useRealTimers();
        fetchMock.hardReset();
        WorkerHttpAuth.unsubscribe(`test`);
    });

    it(`receives token`, async () => {
        fetchMock.route(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentToken()).resolves.toEqual(`bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`);
    });

    it(`reads user from token`, async () => {
        fetchMock.route(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(1);
    });

    it(`updates token`, async () => {
        fetchMock.route(
            `end:/${environment.authUrlPrefix}/who-am-i/`,
            {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_59_UID_2}`
                },
                body: AUTH_BODY
            },
            {
                name: `who-am-i`
            }
        );

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(2);
        fetchMock.modifyRoute(`who-am-i`, {
            response: {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
                },
                body: AUTH_BODY
            }
        });
        vi.advanceTimersByTime(60 * 1000);
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(1);
        await expect(WorkerHttpAuth.updating()).resolves.toEqual(true);
    });

    it(`stop updating token`, async () => {
        fetchMock.route(
            `end:/${environment.authUrlPrefix}/who-am-i/`,
            {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_59_UID_2}`
                },
                body: AUTH_BODY
            },
            {
                name: `who-am-i`
            }
        );

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(2);
        WorkerHttpAuth.stopRefresh();
        fetchMock.modifyRoute(`who-am-i`, {
            response: {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
                },
                body: JSON.parse(AUTH_BODY)
            }
        });
        vi.advanceTimersByTime(60 * 1000);
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(2);
        await expect(WorkerHttpAuth.updating()).resolves.toEqual(false);
    });

    it(`is unauthenticated`, async () => {
        fetchMock.route(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`
            },
            body: ANON_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(null);
        await expect(WorkerHttpAuth.currentToken()).resolves.toEqual(``);
    });

    it(`used invalid token`, async () => {
        fetchMock.route(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            status: 401,
            headers: {
                'Content-Type': `application/json`
            },
            body: FAIL_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expect(WorkerHttpAuth.currentUser()).resolves.toEqual(null);
        await expect(WorkerHttpAuth.currentToken()).resolves.toEqual(``);
        await expect(WorkerHttpAuth.updating()).resolves.toEqual(false);
    });
});
