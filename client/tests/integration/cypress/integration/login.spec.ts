describe('Testing the sign in and out process', () => {
    const AUTH_URL = `/system/auth`;
    const ACTION_URL = 'system/action/handle_request';
    const DELEGATE_NAME = `a`;
    const DEFAULT_MEETING_ID = 1;

    const username = `Mississipi`;
    let secondAccountId: number;
    let meetingId: number;
    let committeeId: number;

    before(() => {
        cy.login();
        cy.createAccount(username).then(({ id }) => {
            cy.createMeeting(`Mississipi_2`, [id]).then(({ id: _meetingId, committeeId: _committeeId }) => {
                meetingId = _meetingId;
                committeeId = _committeeId;
            });
            secondAccountId = id;
        });
        cy.logout();
    });

    after(() => {
        cy.login();
        cy.deleteAccounts(secondAccountId);
        cy.deleteMeetings(meetingId);
        cy.deleteCommittees(committeeId);
        cy.logout();
    });

    beforeEach(() => {
        cy.visit(`/login`);
    });

    afterEach(() => {
        cy.logout();
    });

    it('signs in as superadmin', () => {
        cy.intercept(`${AUTH_URL}/login`).as(`login`);
        cy.getElement(`loginUsernameInput`).type(`admin`);
        cy.getElement(`loginPasswordInput`).type(`admin`);
        cy.getElement(`loginButton`).click();
        cy.wait(`@login`);
        cy.url().should(`not.include`, `login`);
        cy.getCookie("refreshId").should("exist");
    });

    it(`signs in as meeting admin`, () => {
        cy.intercept(`${AUTH_URL}/login`).as(`login`);
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');

        cy.getElement(`loginUsernameInput`).type(username);
        cy.getElement(`loginPasswordInput`).type(username);
        cy.getElement(`loginButton`).click();
        cy.wait(`@login`);
        cy.url().should(`not.include`, `login`);
        cy.url().should(`include`, meetingId);
        cy.getCookie("refreshId").should("exist");
    });

    it(`signs in as delegate`, () => {
        cy.intercept(`${AUTH_URL}/login`).as(`login`);
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');

        cy.getElement(`loginUsernameInput`).type(DELEGATE_NAME);
        cy.getElement(`loginPasswordInput`).type(DELEGATE_NAME);
        cy.getElement(`loginButton`).click();
        cy.wait(`@login`);
        cy.url().should(`not.include`, `login`);
        cy.url().should(`include`, DEFAULT_MEETING_ID);
        cy.getCookie("refreshId").should("exist");
    });
});
