describe(`Testing permission- and auth-guards`, () => {
    const AUTH_URL = `/system/auth`;
    const ACTION_URL = `system/action/handle_request`;
    const DELEGATE_NAME = `a`;
    const ADMIN_NAME = `admin`;
    const DEFAULT_MEETING_ID = 1;

    const setup = (username, url) => {
        cy.login(username, username);
        cy.visit(url);
        return cy.waitUntil(() => Cypress.$(`[data-cy=osOverlay]`).length === 0);
    };

    afterEach(() => {
        cy.logout();
    });

    it(`visit meeting as delegate`, function (done) {
        this.timeout(10000);
        setup(DELEGATE_NAME, `/${DEFAULT_MEETING_ID}`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID] }
                );
            })
            .then(() => done());
    });

    it(`visit meeting as superadmin`, function (done) {
        this.timeout(10000);
        setup(ADMIN_NAME, `/${DEFAULT_MEETING_ID}`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID] }
                );
            })
            .then(() => done());
    });

    it(`visit organization as delegate`, function (done) {
        this.timeout(10000);
        setup(DELEGATE_NAME, `/`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID] }
                );
            })
            .then(() => done());
    });

    it(`visit organization as superadmin`, function (done) {
        this.timeout(10000);
        setup(ADMIN_NAME, `/`)
            .then(() => {
                cy.urlShouldAllOf({ chainer: `not.include`, values: [`login`, `error`, DEFAULT_MEETING_ID] });
            })
            .then(() => done());
    });

    it(`visit organization settings as delegate`, function (done) {
        this.timeout(10000);
        setup(DELEGATE_NAME, `/settings`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`, `settings`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID] }
                );
            })
            .then(() => done());
    });

    it(`visit organization settings as superadmin`, function (done) {
        this.timeout(10000);
        setup(ADMIN_NAME, `/settings`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`, DEFAULT_MEETING_ID] },
                    { chainer: `include`, values: [`settings`] }
                );
            })
            .then(() => done());
    });

    it(`visit organization info as delegate`, function (done) {
        this.timeout(10000);
        setup(DELEGATE_NAME, `/info`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID, `info`] }
                );
            })
            .then(() => done());
    });

    it(`visit organization info as superadmin`, function (done) {
        this.timeout(10000);
        setup(ADMIN_NAME, `/info`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`, DEFAULT_MEETING_ID] },
                    { chainer: `include`, values: [`info`] }
                );
            })
            .then(() => done());
    });

    it(`visit meeting autopilot as delegate`, function (done) {
        this.timeout(10000);
        setup(DELEGATE_NAME, `${DEFAULT_MEETING_ID}/autopilot`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID, `autopilot`] }
                );
            })
            .then(() => done());
    });

    it(`visit meeting autopilot as superadmin`, function (done) {
        this.timeout(10000);
        setup(ADMIN_NAME, `${DEFAULT_MEETING_ID}/autopilot`)
            .then(() => {
                cy.urlShouldAllOf(
                    { chainer: `not.include`, values: [`login`, `error`] },
                    { chainer: `include`, values: [DEFAULT_MEETING_ID, `autopilot`] }
                );
            })
            .then(() => done());
    });
});
