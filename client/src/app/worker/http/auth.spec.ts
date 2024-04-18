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
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        WorkerHttpAuth.reset();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        fetchMock.reset();
        WorkerHttpAuth.unsubscribe(`test`);
    });

    it(`receives token`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentToken()).toBeResolvedTo(`bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`);
    });

    it(`reads user from token`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(1);
    });

    it(`updates token`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_59_UID_2}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(2);
        fetchMock.mock(
            `end:/${environment.authUrlPrefix}/who-am-i/`,
            {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
                },
                body: AUTH_BODY
            },
            { overwriteRoutes: true }
        );
        jasmine.clock().tick(60 * 1000);
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(1);
        await expectAsync(WorkerHttpAuth.updating()).toBeResolvedTo(true);
    });

    it(`stop updating token`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`,
                authentication: `bearer ${AUTH_TOKENS.VALID_TILL_59_UID_2}`
            },
            body: AUTH_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(2);
        WorkerHttpAuth.stopRefresh();
        fetchMock.mock(
            `end:/${environment.authUrlPrefix}/who-am-i/`,
            {
                headers: {
                    'Content-Type': `application/json`,
                    authentication: `bearer ${AUTH_TOKENS.VALID_TILL_120_UID_1}`
                },
                body: AUTH_BODY
            },
            { overwriteRoutes: true }
        );
        jasmine.clock().tick(60 * 1000);
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(2);
        await expectAsync(WorkerHttpAuth.updating()).toBeResolvedTo(false);
    });

    it(`is unauthenticated`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            headers: {
                'Content-Type': `application/json`
            },
            body: ANON_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(null);
        await expectAsync(WorkerHttpAuth.currentToken()).toBeResolvedTo(``);
    });

    it(`used invalid token`, async () => {
        fetchMock.mock(`end:/${environment.authUrlPrefix}/who-am-i/`, {
            status: 401,
            headers: {
                'Content-Type': `application/json`
            },
            body: FAIL_BODY
        });

        WorkerHttpAuth.subscribe(`test`, () => {});
        await WorkerHttpAuth.update();
        await expectAsync(WorkerHttpAuth.currentUser()).toBeResolvedTo(null);
        await expectAsync(WorkerHttpAuth.currentToken()).toBeResolvedTo(``);
        await expectAsync(WorkerHttpAuth.updating()).toBeResolvedTo(false);
    });
});
