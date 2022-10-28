import { BrowserContext, expect } from '@playwright/test';

export async function os4request(context: BrowserContext, osAction: string, body: any): Promise<any> {
    const response = await context.request.post('/system/action/handle_request', {
        data: [{
            action: osAction,
            data: [{
                ...body
            }]
        }]
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody?.success).toBeTruthy();

    return responseBody?.results[0][0];
}

export async function createAccount(context: BrowserContext, name: string = `TestUser ${Date.now().toString()}`): Promise<{ id: number, name: string }> {
    const accountData = {
        username: name,
        default_password: name,
        is_active: true
    };

    return await os4request(context, `user.create`, accountData).then(res => ({ id: res.id, name }));
}

export async function createCommittee(context: BrowserContext, name: string = `TestMeeting ${Date.now().toString()}`): Promise<{ id: number, name: string }> {
    const committeeData = {
        organization_id: 1,
        name,
        user_$_management_level: { can_manage: [1] }
    };

    return await os4request(context, `committee.create`, committeeData).then(res => ({ id: res.id, name }));
}

export async function createMeeting(context: BrowserContext, name: string = `TestMeeting ${Date.now().toString()}`, admin_ids: number[] = [1]): Promise<{ id: number, committeeId: number, name: string }> {
    let { id } = await createCommittee(context, name);
    const meetingData = {
        committee_id: id,
        name,
        admin_ids
    };

    return await os4request(context, `meeting.create`, meetingData).then(res => ({ id: res.id, name, committeeId: id }));
}

export async function deleteAccounts(context: BrowserContext, ...ids: number[]): Promise<void> {
    for (const id of ids) {
        await os4request(context, `user.delete`, { id });
    }
}

export async function deleteMeetings(context: BrowserContext, ...ids: number[]): Promise<void> {
    for (const id of ids) {
        await os4request(context, `meeting.delete`, { id });
    }
}

export async function deleteCommittees(context: BrowserContext, ...ids: number[]): Promise<void> {
    for (const id of ids) {
        await os4request(context, `committee.delete`, { id });
    }
}
