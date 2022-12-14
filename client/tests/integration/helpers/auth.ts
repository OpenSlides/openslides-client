import { BrowserContext, APIRequestContext, expect } from '@playwright/test';

export async function login(context: BrowserContext, username: string = 'admin', password?: string): Promise<void> {
    const response = await context.request.post('/system/auth/login', {
        data: {
            username,
            password: password || username
        }
    });

    expect(response.ok()).toBeTruthy();
    await context.setExtraHTTPHeaders({
        authentication: response.headers()['authentication']
    });
}

export async function whoAmI(context: BrowserContext): Promise<void> {
    const response = await context.request.post('/system/auth/who-am-i', {
        data: {}
    });

    expect(response.ok()).toBeTruthy();
    await context.setExtraHTTPHeaders({
        authentication: response.headers()['authentication']
    });
}

export async function logout(context: BrowserContext, requestContext?: APIRequestContext): Promise<void> {
    const response = await (requestContext || context.request).post('/system/auth/secure/logout', {
        data: {}
    });

    expect(response.ok()).toBeTruthy();
    await context.setExtraHTTPHeaders({
        authentication: ''
    });
}
