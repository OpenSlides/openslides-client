import { Locator, Page } from '@playwright/test';
import { MeetingHomePage } from './detail';

export class MeetingHomeEditPage {
    private readonly page: Page;
    public readonly frontPageTitleInput: Locator;
    public readonly welcomeTextEditor: Locator;
    public readonly saveButton: Locator;
    public readonly closeButton: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.frontPageTitleInput = page.locator(`[formcontrolname=welcome_title]`);
        this.welcomeTextEditor = page.locator(`.editor-content .tiptap`);
        this.saveButton = page.locator(`[data-cy=headbarSaveButton]`);
        this.closeButton = page.locator(`[data-cy=headbarCloseButton]`);
    }

    async goto(meetingId: number) {
        let homePage = new MeetingHomePage(this.page);
        await homePage.goto(meetingId);
        await homePage.edit();
    }

    async save() {
        await this.saveButton.click();
    }

    async close() {
        await this.closeButton.click();
    }
}
