describe('Topics are gathered', () => {
    beforeEach(() => {
        cy.login();
        cy.visit(`/`);
        cy.getAnchorFor(`/1`).click();
        cy.url().should('include', `/1`);
    });

    it(`can access the agenda`, () => {
        cy.wait(200);
        cy.getAnchorFor(`/1/agenda`).click();
        cy.url().should(`include`, `/agenda`);
    });
});
