import { Locator, Page } from '@playwright/test';

export class MeetingHomePage {
    private readonly page: Page;
    public readonly frontPageTitle: Locator;
    public readonly welcomeText: Locator;
    public readonly editButton: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.frontPageTitle = page.locator(`mat-sidenav-content`).locator(`.app-content > h1`);
        this.welcomeText = page.locator(`mat-sidenav-content`).locator(`.app-content > div`);
        this.editButton = page.locator(`[data-cy=headbarMainButton]`);
    }

    async goto(meetingId: number) {
        await this.page.goto(`/${meetingId}`);
    }

    async edit() {
        await this.editButton.click();
    }
}
