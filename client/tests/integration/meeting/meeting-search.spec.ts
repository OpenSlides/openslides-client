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

test.describe('Testing meeting search', () => {
    let username = 'MeetingSearchTestUser';
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };
    let topic: { id: number; sequential_number: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        username = username + Date.now().toString();
        account = await createAccount(context, username);
        meeting = await createMeeting(context, `Demo Meeting${Date.now().toString()}`, [account.id]);
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

    test('search for agenda topic in meeting' , async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/home`);
        await page.locator('button[aria-label="Global Search"]').click();
        await page.locator('input[placeholder="Search"]').fill('AgendaTest');
        await page.locator('input[value="current"]').click();
        await page.locator('.filter-section').locator('div', { hasText: 'Agenda'}).click();
        await page.locator('input[placeholder="Search"]').press('Enter');
        await expect(page.locator('.search-results-category')).toContainText('AgendaTestTopic');
        await logout(context);
    });

    test('search for blup in meeting and find nothing' , async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/home`);
        await page.locator('button[aria-label="Global Search"]').click();
        await page.locator('input[placeholder="Search"]').fill('blup');
        await page.locator('input[value="current"]').click();
        await page.locator('.filter-section').locator('div', { hasText: 'Agenda'}).click();
        await page.locator('input[placeholder="Search"]').press('Enter');
        await expect(page.locator('h3.search-no-results')).toContainText('No results found');
        await logout(context);
    });
});
