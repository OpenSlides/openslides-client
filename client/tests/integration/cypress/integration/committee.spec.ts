describe('Testing committees', () => {
    const ACTION_URL = 'system/action/handle_request';

    let committee: { id: number; name: string };

    before(() => {
        cy.login();
        cy.createCommittee().then(_committee => {
            committee = _committee;
        });
        cy.logout();
    });

    after(() => {
        cy.login();
        cy.deleteCommittees(committee.id);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndVisit('/committees');
    });

    afterEach(() => {
        cy.logout();
    });

    it('visit committees', () => {
        cy.logout();
        cy.loginAndVisit('/');
        cy.getAnchorFor('/committees').click();
        cy.url().should('include', 'committees');
    });

    it('visits one committee', () => {
        cy.getAnchorFor(`/committees/${committee.id}`).click();
        cy.url().should('include', committee.id);
        cy.contains(committee.name);
        cy.getElement('headbarBackButton').click();
        cy.url().should('include', 'committees');
        cy.url().should('not.include', 'committees/');
    });

    it('creates a committee', () => {
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');
        cy.getElement('headbarMainButton').click();
        cy.url().should('include', 'create');
        const committeeName = `Cypress Committee ${Date.now().toString()}`;
        cy.getElement('committeeName').type(committeeName);

        cy.getElement('headbarSaveButton').click();
        cy.wait('@action');

        cy.url().should('not.include', 'create');
        cy.contains(committeeName);
        cy.url().then(url => {
            let urlSegments = url.split(`/`);
            cy.deleteCommittees(Number(urlSegments[urlSegments.length - 1]));
        });
    });

    it('updates a committee', () => {
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('handle_request');
        cy.contains(committee.name).closest('.scrolling-table-row').find('button.mat-menu-trigger').click();
        cy.getAnchorFor(`/committees/edit-committee?committeeId=${committee.id}`).click();
        cy.url().should('include', 'edit-committee');
        const committeeDescription = 'Hahaha';
        cy.getElement('committeeDescription').type(committeeDescription);
        cy.getElement('headbarSaveButton').click();
        cy.wait('@handle_request');
        cy.url().should('not.include', 'edit-committee');
        cy.contains(committeeDescription);
    });

    it('receives a name change', () => {
        cy.visit(`/committees/${committee.id}`);
        cy.contains(committee.name);
        const updatedName = committee.name + "update";
        const committeeData = {
            id: committee.id,
            name: updatedName,
        };
        cy.os4request("committee.update", committeeData).then(() => {
            cy.contains(updatedName);
        });
    });

    it('deletes a committee', () => {
        cy.createCommittee(`CypressTestDeleteCommittee ${Date.now().toString()}`).then(_committee => {
            cy.intercept({ method: 'POST', url: ACTION_URL }).as('handle_request');
            const delRow = cy.contains(_committee.name).closest('.scrolling-table-row');
            delRow.find('button.mat-menu-trigger').click();
            cy.getElement('committeeListSingleDeleteButton').click();
            cy.get('os-choice-dialog button').first().click();
            cy.wait('@handle_request');
            cy.get(committee.name).should('not.exist');
        });
    });
});
