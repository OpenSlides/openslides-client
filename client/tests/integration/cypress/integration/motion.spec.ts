describe('Motions will be written', () => {
    let meeting: { name: string; id: number };

    before(() => {
        cy.createMeeting().then(_meeting => (meeting = _meeting));
    });

    beforeEach(() => {
        cy.login();
        cy.visit(`/`);
        cy.getAnchorFor(`/${meeting.id}`).click();
        cy.url().should('include', `/${meeting.id}`);
    });

    it(`can access motions`, () => {
        cy.wait(200);
        cy.getAnchorFor(`/${meeting.id}/motions`).click();
        cy.url().should(`include`, `/motions`);
    });
});
