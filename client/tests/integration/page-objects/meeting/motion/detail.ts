import { Page } from '@playwright/test';

export class MeetingMotionDetailPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(meetingId: number, id: number) {
        await this.page.goto(`/${meetingId}/motions/${id}`);
    }
}
