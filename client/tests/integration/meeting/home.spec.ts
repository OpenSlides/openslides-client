import { test, expect } from '@playwright/test';
import { login, logout } from '../helpers/auth';
import { createAccount, createMeeting, deleteAccounts, deleteCommittees, deleteMeetings, os4request } from '../helpers/request';
import { MeetingHomePage } from '../page-objects/meeting/home/detail';
import { MeetingHomeEditPage } from '../page-objects/meeting/home/edit';

test.describe('meeting home tests', () => {
    let username = `CypressMeetingHomeTestUser`;
    let meeting: { id: number; committeeId: number; name: string };
    let account: { id: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        username = username + Date.now().toString();
        account = await createAccount(context, username);
        meeting = await createMeeting(context, `CypressMeetingHomeTestMeeting${Date.now().toString()}`, [account.id]);
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

    test('meeting home loads', async ({ context, page }) => {
        await login(context, username);
        const homePage = new MeetingHomePage(page);
        await homePage.goto(meeting.id);
        await expect(homePage.frontPageTitle).toHaveText(`Welcome to OpenSlides`);
        await expect(homePage.welcomeText).toHaveText(`Space for your welcome text.`);
        await logout(context);
    });

    test('meeting home autoupdate', async ({ context, page }) => {
        await login(context, username);
        const homePage = new MeetingHomePage(page);
        await homePage.goto(meeting.id);
        await expect(homePage.frontPageTitle).toHaveText(`Welcome to OpenSlides`);
        const welcome_title = 'Welcome autoupdate';
        await os4request(context, 'meeting.update', {
            id: meeting.id,
            welcome_title
        });
        await expect(homePage.frontPageTitle).toHaveText(welcome_title);
        await logout(context);
    });

    test('edit meeting home', async ({ context, page }) => {
        await login(context, username);
        const homeEditPage = new MeetingHomeEditPage(page);
        await homeEditPage.goto(meeting.id);
        const newWelcomeTitle = 'Updated welcome title';
        await homeEditPage.frontPageTitleInput.fill(newWelcomeTitle);
        await homeEditPage.save();
        const homePage = new MeetingHomePage(page);
        await expect(homePage.frontPageTitle).toHaveText(newWelcomeTitle);
        await logout(context);
    });
});
