describe('Testing the sign in and out process', () => {
    it(`is okay...`, () => {});

    // const AUTH_URL = `/system/auth`;
    // const ACTION_URL = 'system/action/handle_request';
    // const DELEGATE_NAME = `a`;
    // const DEFAULT_MEETING_ID = 1;

    // const username = `Mississipi`;
    // let secondAccountId: number;
    // let meetingId: number;

    // before(() => {
    //     cy.login();
    //     cy.createAccount(username).then(({ id }) => {
    //         cy.createMeeting(`Mississipi_2`, [id]).then(({ id: _meetingId }) => {
    //             meetingId = _meetingId;
    //         });
    //         secondAccountId = id;
    //     });
    //     cy.logout();
    // });

    // beforeEach(() => {
    //     cy.visit(`/login`);
    // });

    // afterEach(() => {
    //     cy.logout();
    // });

    // it('signs in as superadmin', () => {
    //     cy.intercept(`${AUTH_URL}/login`).as(`login`);
    //     cy.getElement(`loginUsernameInput`).type(`admin`);
    //     cy.getElement(`loginPasswordInput`).type(`admin`);
    //     cy.getElement(`loginButton`).click();
    //     cy.wait(`@login`);
    //     cy.url().should(`not.include`, `login`);
    // });

    // it(`signs in as meeting admin`, () => {
    //     cy.visit(`/login`);
    //     cy.intercept(`${AUTH_URL}/login`).as(`login`);
    //     cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');

    //     cy.getElement(`loginUsernameInput`).type(username);
    //     cy.getElement(`loginPasswordInput`).type(username);
    //     cy.getElement(`loginButton`).click();
    //     cy.wait(`@login`);
    //     cy.url().should(`not.include`, `login`);
    //     cy.url().should(`include`, meetingId);
    // });

    // it(`signs in as delegate`, () => {
    //     cy.visit(`/login`);
    //     cy.intercept(`${AUTH_URL}/login`).as(`login`);
    //     cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');

    //     cy.getElement(`loginUsernameInput`).type(DELEGATE_NAME);
    //     cy.getElement(`loginPasswordInput`).type(DELEGATE_NAME);
    //     cy.getElement(`loginButton`).click();
    //     cy.wait(`@login`);
    //     cy.url().should(`not.include`, `login`);
    //     cy.url().should(`include`, DEFAULT_MEETING_ID);
    // });
});
