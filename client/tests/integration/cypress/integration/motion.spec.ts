describe('Motions will be written', () => {
    beforeEach(() => {
        cy.login();
        cy.visit(`/`);
        cy.getAnchorFor(`/1`).click();
        cy.url().should('include', `/1`);
    });

    it(`can access motions`, () => {
        cy.wait(200);
        cy.getAnchorFor(`/1/motions`).click();
        cy.url().should(`include`, `/motions`);
    });
});
