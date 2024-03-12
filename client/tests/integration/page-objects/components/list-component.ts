import { Locator, Page } from '@playwright/test';

export class ListComponent {
    readonly page: Page;
    readonly osList: Locator;

    public constructor(page: Page, osList?: Locator) {
        this.page = page;
        this.osList = osList || page.locator('os-list').first();
    }

    getRowByText(name: string): Locator {
        return this.osList.locator('.scrolling-table-row', { hasText: name });
    }

    getRowByUrl(url: string): Locator {
        return this.osList.locator('.scrolling-table-row', { has: this.osList.locator(`a[href="${url}"]`) });
    }

    async openRowMenu(row: Locator) {
        await row.scrollIntoViewIfNeeded();
        await row.locator('button.mat-menu-trigger').click();
    }
}
