describe('Testing accounts', () => {
    const ACTION_URL = '/system/action/handle_request';
    const PRESENTER_URL = '/system/presenter/handle_request';

    let account: { id: number; name: string };

    before(() => {
        cy.login();
        cy.createAccount(`CypressTestAccount ${Date.now().toString()}`).then(_account => {
            account = _account;
        });
        cy.logout();
    });

    after(() => {
        cy.login();
        cy.deleteAccounts(account.id);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndVisit('/accounts');
    });

    afterEach(() => {
        cy.logout();
    });

    it('visit accounts', () => {
        cy.logout();
        cy.loginAndVisit('/');
        cy.getAnchorFor('/accounts').click();
        cy.url().should('include', 'accounts');
    });

    it('visits one account', () => {
        cy.getAnchorFor(`/accounts/${account.id}`).click();
        cy.url().should('include', account.id);
        cy.contains(account.name);
        cy.getElement('headbarBackButton').click();
        cy.url().should('include', 'accounts');
        cy.url().should('not.include', 'accounts/');
    });

    it('creates a account', () => {
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('action');
        cy.getElement('headbarMainButton').click();
        cy.url().should('include', 'create');
        const username = `Cypress-Create-User ${Date.now().toString()}`;
        cy.get('[formcontrolname=username]').type(username);

        cy.getElement('headbarSaveButton').click();
        cy.wait('@action', { timeout: 20000 });

        cy.url().should('not.include', 'create');
        cy.contains(username);
        cy.url().then(url => {
            let urlSegments = url.split(`/`);
            cy.deleteAccounts(Number(urlSegments[urlSegments.length - 1]));
        });
    });

    it('updates a account', () => {
        cy.intercept({ method: 'POST', url: ACTION_URL }).as('handle_request');
        cy.contains(account.name).closest('.scrolling-table-row').find('button.mat-menu-trigger').click();
        cy.getAnchorFor(`/accounts/${account.id}/edit`).click();
        cy.url().should('include', `accounts/${account.id}/edit`);
        const pronoun = 'Test';
        cy.get('[formcontrolname=pronoun]').type(pronoun);
        cy.getElement('headbarSaveButton').click();
        cy.wait('@handle_request');
        cy.url().should('not.include', `accounts/${account.id}/edit`);
        cy.contains(`(${pronoun})`);
    });

    it('receives a account name change', () => {
        cy.getAnchorFor(`/accounts/${account.id}`).click();
        cy.contains(account.name);
        const updatedName = 'Updated Name';
        const accountData = {
            id: account.id,
            first_name: updatedName
        };
        cy.os4request('user.update', accountData).then(() => {
            cy.contains(updatedName);
        });
    });

    it('deletes a account', () => {
        cy.createAccount(`CypressTestDeleteAccount ${Date.now().toString()}`).then(delAccount => {
            let delEl = cy.contains(delAccount.name).closest('.scrolling-table-row');
            delEl.find('button.mat-menu-trigger').click();
            cy.intercept({ method: 'POST', url: PRESENTER_URL }).as('wait_presenter');
            cy.contains('delete').closest('button').click();
            cy.wait('@wait_presenter');
            cy.intercept({ method: 'POST', url: ACTION_URL }).as('handle_request');
            cy.get('os-user-delete-dialog button').first().click();
            cy.wait('@handle_request');
            cy.get(delAccount.name).should('not.exist');
        });
    });
});
