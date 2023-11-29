import { BrowserContext, expect } from '@playwright/test';

export async function os4request(context: BrowserContext, osAction: string, body: any): Promise<any> {
    const response = await context.request.post(`/system/action/handle_request`, {
        data: [
            {
                action: osAction,
                data: [
                    {
                        ...body
                    }
                ]
            }
        ]
    });

    const responseBody = await response.json();
    if (response.status() === 202) {
        await new Promise(r => setTimeout(r, 1000));
        const workerFqid = responseBody?.results[0][0].fqid;
        const workerId = workerFqid.split(`/`)[1];
        for (let i = 0; i <= 5; i++) {
            await new Promise(r => setTimeout(r, 1000 + i * 1000));
            const workerStat = await context.request.post(`/system/autoupdate?single=1`, {
                data: [
                    {
                        collection: `action_worker`,
                        fields: { name: null, state: null, created: null, timestamp: null, result: null },
                        ids: [+workerId]
                    }
                ]
            });

            const auBody = await workerStat.json();
            expect(auBody[`${workerFqid}/state`]).not.toBe(`aborted`);
            if (auBody[`${workerFqid}/state`] === `end`) {
                const actionResponse = auBody[`${workerFqid}/response`];
                expect(actionResponse?.status_code).toBe(200);
                expect(actionResponse?.success).toBeTruthy();

                return actionResponse?.results[0][0];
            }
        }
        expect(`run`).not.toBe(`end`);
    }

    expect(response.status()).toBe(200);
    expect(responseBody?.success).toBeTruthy();

    return responseBody?.results[0][0];
}

export async function createAccount(
    context: BrowserContext,
    name: string = `TestUser ${Date.now().toString()}`
): Promise<{ id: number; name: string }> {
    const accountData = {
        username: name,
        default_password: name,
        is_active: true
    };

    return await os4request(context, `user.create`, accountData).then(res => ({ id: res.id, name }));
}

export async function createCommittee(
    context: BrowserContext,
    name: string = `TestMeeting ${Date.now().toString()}`
): Promise<{ id: number; name: string }> {
    const committeeData = {
        organization_id: 1,
        name,
        manager_ids: [1]
    };

    return await os4request(context, `committee.create`, committeeData).then(res => ({ id: res.id, name }));
}

export async function createMeeting(
    context: BrowserContext,
    name: string = `TestMeeting ${Date.now().toString()}`,
    admin_ids: number[] = [1]
): Promise<{ id: number; committeeId: number; name: string }> {
    let { id } = await createCommittee(context, name);
    const meetingData = {
        committee_id: id,
        name,
        language: `en`,
        admin_ids
    };

    return await os4request(context, `meeting.create`, meetingData).then(res => ({
        id: res.id,
        name,
        committeeId: id
    }));
}

export async function updateOrganization(context: BrowserContext, data: { [key: string]: any }): Promise<void> {
    await os4request(context, `organization.update`, { ...data, id: 1 });
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
