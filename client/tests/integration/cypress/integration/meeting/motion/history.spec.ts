describe('motion history mode test', () => {
    const ADMIN_ID = 1;
    let meeting: { id: number; committeeId: number; name: string };
    let motion: { id: number; sequential_number: number };

    before(() => {
        cy.login();
        cy.createMeeting(`CypressMeetingMotionHistoryTestMeeting${Date.now().toString()}`, [ADMIN_ID]).then(
            _meeting => {
                meeting = _meeting;
                cy.os4request('motion.create', {
                    meeting_id: meeting.id,
                    title: 'CypressMotionHistoryTestTitle',
                    text: '<p>CypressMotionHistoryTestText</p>',
                    submitter_ids: [],
                    category_id: null,
                    attachment_ids: [],
                    reason: '',
                    supporter_ids: [],
                    agenda_create: false,
                    agenda_type: 'internal'
                }).then(_motion => {
                    motion = _motion;
                    cy.os4request('poll.create', {
                        meeting_id: meeting.id,
                        title: 'Vote',
                        onehundred_percent_base: 'YNA',
                        pollmethod: 'YNA',
                        type: 'pseudoanonymous',
                        global_abstain: false,
                        global_no: false,
                        global_yes: false,
                        max_votes_amount: 1,
                        min_votes_amount: 1,
                        max_votes_per_option: 1,
                        options: [
                            {
                                content_object_id: `motion/${motion.id}`
                            }
                        ],
                        content_object_id: `motion/${motion.id}`,
                        backend: 'fast'
                    });

                    cy.os4request('motion.update', {
                        id: motion.id,
                        title: 'CypressMotionHistoryTestChangedTitle',
                        text: '<p>CypressMotionHistoryTestChangedText</p>'
                    });
                });
            }
        );
        cy.logout();
    });

    after(() => {
        cy.login();
        cy.deleteMeetings(meeting.id);
        cy.logout();
    });

    it('history entry exists', () => {
        cy.loginAndVisit(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        cy.contains(`Motion created`);
        cy.logout();
    });

    it('history mode banner appears', () => {
        cy.loginAndVisit(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        cy.wait(3000);
        cy.contains(`Motion created`).closest('mat-row').click();
        cy.contains(`You are using the history mode of OpenSlides.`);
        cy.logout();
    });

    it('history mode changes get reverted', () => {
        cy.loginAndVisit(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        cy.wait(3000);
        cy.contains(`Motion created`).closest('mat-row').click();
        cy.contains(`CypressMotionHistoryTestTitle`);
        cy.contains(`CypressMotionHistoryTestText`);
        cy.get(`os-motion-poll`).should('not.exist');
        cy.logout();
    });

    it('history mode leave', () => {
        cy.loginAndVisit(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        cy.wait(3000);
        cy.contains(`Motion created`).closest('mat-row').click();
        cy.contains(`CypressMotionHistoryTestTitle`);
        cy.contains(`Exit`).click({ force: true });
        cy.contains(`CypressMotionHistoryTestChangedTitle`);
        cy.contains(`CypressMotionHistoryTestChangedText`);
        cy.get(`os-motion-poll`).should('exist');
        cy.logout();
    });
});
