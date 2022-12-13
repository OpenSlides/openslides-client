import { test, expect } from '@playwright/test';
import { login, logout } from '../helpers/auth';
import { createAccount, deleteAccounts, os4request } from '../helpers/request';
import { ListComponent } from '../page-objects/components/list-component';

test.describe('Testing accounts', () => {
    let account: { id: number; name: string };

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        account = await createAccount(context, `TestAccount ${Date.now().toString()}`);
        await logout(context);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        await login(context);
        await deleteAccounts(context, account.id);
        await logout(context);
    });

    test('visit accounts', async ({ context, page }) => {
        await login(context);
        await page.goto('/');
        await page.locator('a[href="/accounts"]').click();
        await expect(page).toHaveURL(`/accounts`);
        await logout(context);
    });

    test('visits one account', async ({ context, page }) => {
        await login(context);
        await page.goto(`/accounts`);
        const listComponent = new ListComponent(page);
        await listComponent.getRowByText(account.name).scrollIntoViewIfNeeded();
        await listComponent.getRowByText(account.name).click();
        await expect(page).toHaveURL(`/accounts/${account.id}`);
        await expect(page.locator(`body`)).toContainText(account.name);
        await page.locator('[data-cy=headbarBackButton]').click();
        await expect(page).toHaveURL(`/accounts`);
        await logout(context);
    });

    test('creates a account', async ({ context, page }) => {
        await login(context);
        await page.goto('/accounts');
        await page.locator('[data-cy=headbarMainButton]').click();
        await expect(page).toHaveURL(`/accounts/create`);
        const username = `Create-User ${Date.now().toString()}`;
        await page.locator('[formcontrolname=username]').fill(username);

        await page.locator('[data-cy=headbarSaveButton]').click();

        await expect(page).not.toHaveURL(`/accounts/create`);
        await expect(page.locator(`body`)).toContainText(username);
        const url = page.url();
        const urlSegments = url.split(`/`);
        await deleteAccounts(context, Number(urlSegments[urlSegments.length - 1]));
        await logout(context);
    });

    test('updates a account', async ({ context, page }) => {
        await login(context);
        await page.goto('/accounts');
        const listComponent = new ListComponent(page);
        await listComponent.openRowMenu(listComponent.getRowByText(account.name));
        await page.locator(`a[href="/accounts/${account.id}/edit"]`).click();
        await expect(page).toHaveURL(`/accounts/${account.id}/edit`);
        const pronoun = 'Test';
        await page.locator('[formcontrolname=pronoun]').fill(pronoun);
        await page.locator('[data-cy=headbarSaveButton]').click();
        await expect(page).not.toHaveURL(`/accounts/${account.id}/edit`);
        await expect(page.locator(`body`)).toContainText(`(${pronoun})`);
        await logout(context);
    });

    test('receives a account name change', async ({ context, page }) => {
        await login(context);
        await page.goto('/accounts');
        await page.locator(`a[href="/accounts/${account.id}"]`).click();
        await expect(page.locator(`body`)).toContainText(account.name);
        const updatedName = 'Updated Name';
        const accountData = {
            id: account.id,
            first_name: updatedName
        };
        await os4request(context, 'user.update', accountData);
        await expect(page.locator(`body`)).toContainText(updatedName);
        await logout(context);
    });

    test('deletes a account', async ({ context, page }) => {
        await login(context);
        await page.goto('/accounts');
        const delAccount = await createAccount(context, `TestDeleteAccount ${Date.now().toString()}`);
        const listComponent = new ListComponent(page);
        await listComponent.openRowMenu(listComponent.getRowByText(delAccount.name));
        await page.locator('.mat-menu-content button', { hasText: `Delete` }).first().click();
        await page.locator('os-user-delete-dialog button', { hasText: `Yes, delete` }).first().click();
        await expect(listComponent.getRowByText(delAccount.name)).toBeHidden();
        await logout(context);
    });
});
