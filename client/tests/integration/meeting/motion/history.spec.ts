import { expect, test } from '@playwright/test';

import { login, logout } from '../../helpers/auth';
import { createMeeting, deleteCommittees, deleteMeetings, os4request } from '../../helpers/request';

test.describe(`motion history mode test`, () => {
    const ADMIN_ID = 1;
    let meeting: { id: number; committeeId: number; name: string };
    let motion: { id: number; sequential_number: number };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        meeting = await createMeeting(context, `MeetingMotionHistoryTestMeeting${Date.now().toString()}`, [ADMIN_ID]);
        motion = await os4request(context, `motion.create`, {
            meeting_id: meeting.id,
            title: `MotionHistoryTestTitle`,
            text: `<p>MotionHistoryTestText</p>`,
            category_id: null,
            attachment_mediafile_ids: [],
            reason: ``,
            supporter_meeting_user_ids: [],
            agenda_create: false,
            agenda_type: `internal`
        });
        await os4request(context, `poll.create`, {
            meeting_id: meeting.id,
            title: `Vote`,
            onehundred_percent_base: `YNA`,
            pollmethod: `YNA`,
            type: `pseudoanonymous`,
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
            backend: `fast`
        });
        await os4request(context, `motion.update`, {
            id: motion.id,
            title: `MotionHistoryTestChangedTitle`,
            text: `<p>MotionHistoryTestChangedText</p>`
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

    test(`history entry exists`, async ({ context, page }) => {
        await login(context);
        await page.goto(`/${meeting.id}/history?fqid=motion%2F${motion.id}`);
        await expect(page.locator(`body`)).toContainText(`Motion created`);
        await logout(context);
    });
});
