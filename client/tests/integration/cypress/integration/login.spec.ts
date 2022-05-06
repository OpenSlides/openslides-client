describe('Testing the sign in and out process', () => {
    const AUTH_URL = `/system/auth`;
    const ACTION_URL = 'system/action/handle_request';

    const username = `Mississipi`;
    let secondAccountId: number;
    let meetingId: number;

    before(() => {
        cy.login();
        cy.createAccount(username).then(({ id }) => {
            cy.createMeeting(`Mississipi_2`, [id]).then(({ id: _meetingId }) => {
                meetingId = _meetingId;
            });
            secondAccountId = id;
        });
        cy.logout();
    });

    beforeEach(() => {
        cy.visit(`/login`);
    });

    afterEach(() => {
        cy.logout();
    });

    it('signs in as superadmin', () => {
        cy.getElement(`loginUsernameInput`).type(`admin`);
        cy.getElement(`loginPasswordInput`).type(`admin`);
        cy.getElement(`loginButton`).click();
        cy.wait(`@login`);
        cy.url().should(`not.include`, `login`);
    });

    it(`signs in as meeting admin`, () => {
        cy.visit(`/login`);
        cy.intercept(`${AUTH_URL}/login`).as(`login`);
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');

        cy.getElement(`loginUsernameInput`).type(username);
        cy.getElement(`loginPasswordInput`).type(username);
        cy.getElement(`loginButton`).click();
        cy.wait(`@login`);
        cy.url().should(`not.include`, `login`);
        cy.url().should(`include`, meetingId);
    });
});
