import { test, expect } from '@playwright/test';
import { login, logout } from '../helpers/auth';
import { createCommittee, deleteCommittees, os4request } from '../helpers/request';

test.describe('Testing committees', () => {
    let committee: { id: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        committee = await createCommittee(context);
        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteCommittees(context, committee.id);
        await logout(context);
    });

    test('visit committees', async ({ context, page }) => {
        await login(context);
        await page.goto('/');
        await page.locator('a[href="/committees"]').click();
        await expect(page).toHaveURL(`/committees`);
        await logout(context);
    });

    test('visits one committee', async ({ context, page }) => {
        await login(context);
        await page.goto(`/committees`);
        await page.locator(`a[href="/committees/${committee.id}"]`).click();
        await expect(page).toHaveURL(`/committees/${committee.id}`);
        await expect(page.locator(`body`)).toContainText(committee.name);
        await page.locator('[data-cy=headbarBackButton]').click();
        await expect(page).toHaveURL(`/committees`);
        await logout(context);
    });

    test('creates a committee', async ({ context, page }) => {
        await login(context);
        await page.goto(`/committees`);
        await page.locator('[data-cy=headbarMainButton]').click();
        await expect(page).toHaveURL(`/committees/create`);
        const committeeName = `Cypress Committee ${Date.now().toString()}`;
        await page.locator('[data-cy=committeeName]').fill(committeeName);

        await page.locator('[data-cy=headbarSaveButton]').click();

        await expect(page).not.toHaveURL(`/committees/create`);
        await expect(page.locator(`body`)).toContainText(committeeName);
        const url = page.url();
        const urlSegments = url.split(`/`);
        await deleteCommittees(context, Number(urlSegments[urlSegments.length - 1]));
        await logout(context);
    });

    test('receives a name change', async ({ context, page }) => {
        await login(context);
        await page.goto(`/committees/${committee.id}`);
        await expect(page.locator(`body`)).toContainText(committee.name);
        const updatedName = committee.name + 'update';
        const committeeData = {
            id: committee.id,
            name: updatedName
        };
        await os4request(context, 'committee.update', committeeData);
        await expect(page.locator(`body`)).toContainText(updatedName);
        await logout(context);
    });

    test('updates a committee', async ({ context, page }) => {
        await login(context);
        await page.goto(`/committees`);
        await page.locator('.scrolling-table-row', { hasText: committee.name }).locator('button.mat-menu-trigger').click();
        await page.locator(`a[href="/committees/edit-committee?committeeId=${committee.id}"]`).click();
        await expect(page).toHaveURL(`/committees/edit-committee?committeeId=${committee.id}`);
        const committeeDescription = 'Hahaha';
        await page.locator('[data-cy=committeeDescription]').fill(committeeDescription);
        await page.locator('[data-cy=headbarSaveButton]').click();
        await expect(page).toHaveURL(`/committees/${committee.id}`);
        await expect(page.locator(`body`)).toContainText(committeeDescription);
        await logout(context);
    });

    test('deletes a committee', async ({ context, page }) => {
        await login(context);
        await page.goto(`/committees`);
        let delCommittee = await createCommittee(context, `CypressTestDeleteCommittee ${Date.now().toString()}`);
        await page.locator('.scrolling-table-row', { hasText: delCommittee.name }).locator('button.mat-menu-trigger').click();
        await page.locator('.mat-menu-content button', { hasText: `Delete` }).first().click();
        await page.locator('os-choice-dialog button', { hasText: `Yes` }).first().click();
        await expect(page.locator('.scrolling-table-row', { hasText: delCommittee.name })).toBeHidden();
        await logout(context);
    });
});
