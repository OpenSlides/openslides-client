describe('meeting home tests', () => {
    let username = `CypressMeetingHomeTestUser`;
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };

    before(() => {
        username = username + Date.now().toString();
        cy.login();
        cy.createAccount(username).then(_account => {
            cy.createMeeting(`CypressMeetingHomeTestMeeting${Date.now().toString()}`, [_account.id]).then(_meeting => {
                meeting = _meeting;
            });
            account = _account;
        });
        cy.logout();
    });

    after(() => {
        cy.login();
        cy.deleteMeetings(meeting.id);
        cy.deleteCommittees(meeting.committeeId);
        cy.deleteAccounts(account.id);
        cy.logout();
    });

    it('meeting home loads', () => {
        cy.loginAndVisit(`/${meeting.id}`, username, username);
        cy.contains(meeting.name);
        cy.contains(`Space for your welcome text.`);
    });

    it('meeting home autoupdate', () => {
        cy.loginAndVisit(`/${meeting.id}`, username, username);
        const welcome_title = 'Welcome autoupdate';
        cy.os4request('meeting.update', {
            id: meeting.id,
            welcome_title
        }).then(() => {
            cy.contains(welcome_title);
        });
    });

    it('edit meeting home', () => {
        cy.loginAndVisit(`/${meeting.id}`, username, username);
        cy.getElement('headbarMainButton').click();
        cy.getElement('headbarCloseButton').should('exist');
        const newWelcomeTitle = 'Updated welcome title';
        cy.getFormControl('welcome_title').clear().type(newWelcomeTitle);
        // TODO: Test TinyMCE welcome_text
        cy.getElement('headbarSaveButton').click();
        cy.contains(newWelcomeTitle);
    });
});
