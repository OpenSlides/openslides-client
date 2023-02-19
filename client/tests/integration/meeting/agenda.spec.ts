import { test, expect } from '@playwright/test';
import { login, logout } from '../helpers/auth';
import {
    createAccount,
    createMeeting,
    deleteAccounts,
    deleteCommittees,
    deleteMeetings,
    os4request
} from '../helpers/request';

test.describe('agenda tests', () => {
    let username = `AgendaTestUser`;
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };
    let topic: { id: number; sequential_number: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        username = username + Date.now().toString();
        account = await createAccount(context, username);
        meeting = await createMeeting(
            context,
            `AgendaTestMeeting${Date.now().toString() + Math.floor(Math.random() * 100)}`,
            [account.id]
        );
        const title = `AgendaTestTopic${Date.now().toString()}`;
        topic = await os4request(context, 'topic.create', {
            meeting_id: meeting.id,
            title,
            agenda_type: 'common',
            text: `Agenda Test Topic Text`,
            agenda_parent_id: null
        });
        topic.name = title;
        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteMeetings(context, meeting.id);
        await deleteCommittees(context, meeting.committeeId);
        await deleteAccounts(context, account.id);
        await logout(context);
    });

    test('visit agenda list', async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}`);
        await page.locator(`a[href="/${meeting.id}/agenda"]`).click();
        await expect(page).toHaveURL(`/${meeting.id}/agenda`);
        await logout(context);
    });

    test('visits one topic', async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/${meeting.id}/agenda`);
        await page.locator(`a[href="/${meeting.id}/agenda/topics/${topic.sequential_number}"]`).click();
        await expect(page).toHaveURL(`/${meeting.id}/agenda/topics/${topic.sequential_number}`);
        await expect(page.locator(`body`)).toContainText(topic.name);
        await page.locator('[data-cy=headbarBackButton]').click();
        await expect(page).toHaveURL(`/${meeting.id}/agenda`);
        await logout(context);
    });

    test('create agenda item', async ({ context, page }) => {
        await login(context, username);
        await page.goto(`/${meeting.id}/agenda`);
        await page.locator('[data-cy=headbarMainButton]').click();
        const agendaTitle = `AgendaCreateTest${Date.now().toString()}`;
        await page.locator('[formcontrolname=title]').fill(agendaTitle);
        await page.locator('[data-cy=headbarSaveButton]').click();
        await expect(page.locator(`.title-line`, { hasText: agendaTitle })).toBeVisible();
        await logout(context);
    });
});
