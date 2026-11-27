import { expect, test } from '@playwright/test';

import { login, logout } from '../../helpers/auth';
import { createMeeting, deleteCommittees, deleteMeetings, os4request } from '../../helpers/request';
import { MeetingMotionDetailPage } from '../../page-objects/meeting/motion/detail';

test.describe(`motion poll test`, () => {
    const ADMIN_ID = 1;
    let meeting: { id: number; committeeId: number; name: string };
    let motion: { id: number; sequential_number: number };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        meeting = await createMeeting(context, `MeetingMotionHistoryTestMeeting${Date.now().toString()}`, [ADMIN_ID]);
        motion = await os4request(context, `motion.create`, {
            meeting_id: meeting.id,
            title: `MotionPollTestTitle`,
            text: `<p>MotionPollTestText</p>`,
            category_id: null,
            attachment_mediafile_ids: [],
            reason: ``,
            supporter_meeting_user_ids: [],
            agenda_create: false,
            agenda_type: `internal`
        });

        await os4request(context, `user.set_present`, {
            present: true,
            meeting_id: meeting.id,
            id: ADMIN_ID
        });

        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteMeetings(context, meeting.id);
        await deleteCommittees(context, meeting.committeeId);
        await logout(context);
    });

    test(`create poll`, async ({ context, page }) => {
        await login(context);

        const motionPage = new MeetingMotionDetailPage(page);
        await motionPage.goto(meeting.id, motion.sequential_number);
        await motionPage.newVoteButton.click();
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.locator('.poll-title')).toHaveText('Motion 01 Vote');

        await logout(context);
    });

    test(`send vote`, async ({ context, page }) => {
        await login(context);

        const motionPage = new MeetingMotionDetailPage(page);
        await motionPage.goto(meeting.id, motion.sequential_number);
        await motionPage.newVoteButton.click();
        await page.getByText('Entitled to vote Delegates').click();
        await page.getByRole('option', { name: 'Admin' }).locator('mat-pseudo-checkbox').click();
        await page.locator(`body`).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Start voting' }).click();
        await page.getByRole('radio', { name: 'Yes' }).scrollIntoViewIfNeeded();
        await page.getByRole('radio', { name: 'Yes' }).click();
        await page.getByRole('button', { name: 'OK' }).click();

        await expect(page.getByText('Voting successful.')).toHaveText('Voting successful.');

        await page.getByRole('button', { name: 'Stop voting' }).click();
        await page.getByRole('button', { name: 'Stop & publish' }).click();
        await expect(page.getByRole('cell', { name: '100%' }).first().locator('.amount')).toHaveText('1');

        await logout(context);
    });
});
