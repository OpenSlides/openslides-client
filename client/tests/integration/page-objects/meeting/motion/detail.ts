import { Locator, Page } from '@playwright/test';

export class MeetingMotionDetailPage {
    private readonly page: Page;
    public readonly newVoteButton: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.newVoteButton = page.locator(`#new-vote`);
    }

    async goto(meetingId: number, id: number) {
        await this.page.goto(`/${meetingId}/motions/${id}`);
    }
}
