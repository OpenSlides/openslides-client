import { test, expect } from '@playwright/test';
import { login, logout } from '../../helpers/auth';
import { createMeeting, deleteCommittees, deleteMeetings, os4request } from '../../helpers/request';

test.describe('motion history mode test', () => {
    const ADMIN_ID = 1;
    let meeting: { id: number; committeeId: number; name: string };
    let motion: { id: number; sequential_number: number };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        meeting = await createMeeting(context, `MeetingMotionHistoryTestMeeting${Date.now().toString()}`, [ADMIN_ID]);
        motion = await os4request(context, 'motion.create', {
            meeting_id: meeting.id,
            title: 'MotionHistoryTestTitle',
            text: '<p>MotionHistoryTestText</p>',
            submitter_ids: [],
            category_id: null,
            attachment_ids: [],
            reason: '',
            supporter_ids: [],
            agenda_create: false,
            agenda_type: 'internal'
        });
        await os4request(context, 'poll.create', {
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
        await os4request(context, 'motion.update', {
            id: motion.id,
            title: 'MotionHistoryTestChangedTitle',
            text: '<p>MotionHistoryTestChangedText</p>'
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

    test('history entry exists', async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        await expect(page.locator(`body`)).toContainText(`Motion created`);
        await logout(context);
    });

    test('history mode banner appears', async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await expect(page.locator(`body`)).toContainText(`Motion created`);
        await page.getByText(`Motion created`).first().click();
        await page.waitForURL(`/${meeting.id}/motions/${motion.sequential_number}`);
        await expect(page.locator(`body`)).toContainText(`You are using the history mode of OpenSlides.`);
        await logout(context);
    });

    test('history mode changes get reverted', async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.getByText(`Motion created`).first().click();
        await page.waitForURL(`/${meeting.id}/motions/${motion.sequential_number}`);
        await expect(page.locator(`body`)).toContainText(`MotionHistoryTestTitle`);
        await expect(page.locator(`body`)).toContainText(`MotionHistoryTestText`);
        await expect(page.locator(`os-motion-poll`)).not.toBeVisible();
        await logout(context);
    });

    test('history mode leave', async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.getByText(`Motion created`).first().click();
        await page.waitForURL(`/${meeting.id}/motions/${motion.sequential_number}`);
        await expect(page.locator(`body`)).toContainText(`MotionHistoryTestTitle`);
        await page.locator('a', { hasText: `Exit` }).first().click();
        await expect(page.locator(`body`)).toContainText(`MotionHistoryTestChangedTitle`);
        await expect(page.locator(`body`)).toContainText(`MotionHistoryTestChangedText`);
        await expect(page.locator(`os-motion-poll`)).toBeVisible();
        await logout(context);
    });
});
