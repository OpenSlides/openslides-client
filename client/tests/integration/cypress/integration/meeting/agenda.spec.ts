describe('agenda tests', () => {
    let username = `CypressAgendaTestUser`;
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };
    let topic: { id: number; sequential_number: number; name: string };

    before(() => {
        username = username + Date.now().toString();
        cy.login();
        cy.createAccount(username).then(_account => {
            cy.createMeeting(`CypressAgendaTestMeeting${Date.now().toString()}`, [_account.id]).then(_meeting => {
                meeting = _meeting;

                const title = `CypressAgendaTestTopic${Date.now().toString()}`;
                cy.os4request('topic.create', {
                    meeting_id: meeting.id,
                    title,
                    agenda_type: 'common',
                    text: `Cypress Agenda Test Topic Text`,
                    agenda_parent_id: null
                }).then((_topic) => {
                    topic = _topic;
                    topic.name = title;
                });
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

    it('visit agenda list', () => {
        cy.loginAndVisit(`/${meeting.id}`);
        cy.getAnchorFor(`/${meeting.id}/agenda`).click();
        cy.url().should('include', 'agenda');
    });

    it('visits one topic', () => {
        cy.loginAndVisit(`/${meeting.id}/agenda`);
        cy.getAnchorFor(`/${meeting.id}/agenda/topics/${topic.sequential_number}`).click();
        cy.url().should('include', topic.sequential_number);
        cy.contains(topic.name);
        cy.getElement('headbarBackButton').click();
        cy.url().should('include', 'agenda');
        cy.url().should('not.include', 'agenda/topics');
    });

    it('create agenda item', () => {
        cy.loginAndVisit(`/${meeting.id}/agenda`);
        cy.getElement('headbarMainButton').click();
        const agendaTitle = `CypressAgendaCreateTest${Date.now().toString()}`;
        cy.getFormControl('title').type(agendaTitle);
        cy.getElement('headbarSaveButton').click();
        cy.contains(agendaTitle);
        cy.logout();
    });
})
