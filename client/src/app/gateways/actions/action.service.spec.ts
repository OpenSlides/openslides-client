import { TestBed } from '@angular/core/testing';
import { QueryParams } from 'src/app/infrastructure/definitions/http';

import { HttpService } from '../http.service';
import { Action, createEmptyAction } from './action';
import { ActionService } from './action.service';
import { ActionError, ActionRequest, ActionResponse } from './action-utils';

const ACTION_URL = `/system/action/handle_request`;
const ACTION_SEPARATELY_URL = `/system/action/handle_separately`;

class MockHttpService {
    public lastPosts: { path: string; data: any; queryParams: QueryParams }[] = [];

    public returnType: `response` | `error` | `nothing` | `too little` | `non-response` | `no results` = `response`;

    public constructor() {}

    public async post<R>(path: string, data: any, queryParams: QueryParams): Promise<R> {
        this.lastPosts.push({ path, data, queryParams });
        if (
            ![ACTION_URL, ACTION_SEPARATELY_URL].includes(path) ||
            data.some(date => !date[`action`] || !date[`data`].length)
        ) {
            throw new Error(`Parameters for http post had incorrect data: ${JSON.stringify(this.lastPosts[0])}`);
        }
        switch (this.returnType) {
            case `response`:
                return this.wrapInActionResponse([[data]]) as unknown as R;
            case `error`:
                return this.getActionError(data[0].action) as unknown as R;
            case `too little`:
                return this.wrapInActionResponse([]) as unknown as R;
            case `non-response`:
                return `I am a string` as unknown as R;
            case `no results`:
                return {
                    success: true,
                    message: `Actions handeled successfully`
                } as unknown as R;
            default:
                return null;
        }
    }

    private wrapInActionResponse<R>(data?: ((R | null)[] | null)[]): ActionResponse<R> {
        return {
            success: true,
            message: `Actions handeled successfully`,
            results: data
        };
    }

    private getActionError(action: string): ActionError {
        return {
            success: false,
            message: `Action ${action} failed`,
            error_index: 234
        };
    }
}

const exampleData = [
    { data: undefined, expected: `null` },
    { data: null, expected: `null` },
    { data: 0, expected: `0` },
    { data: 1, expected: `1` },
    { data: -2, expected: `-2` },
    { data: Number.NaN, expected: `null` },
    { data: Number.POSITIVE_INFINITY, expected: `null` },
    { data: `a`, expected: `"a"` },
    { data: ``, expected: `""` },
    { data: `1`, expected: `"1"` },
    { data: { a: 1 }, expected: `{"a":1}` },
    { data: {}, expected: `{}` },
    { data: [1, 2, 3], expected: `[1,2,3]` },
    { data: [], expected: `[]` }
];

function getExampleSlice(start: number, end = 0): any {
    start = start % exampleData.length;
    end = end % (exampleData.length + 1);
    return start >= end ? exampleData.slice(start) : exampleData.slice(start, end);
}

function getActionData(start: number, end = 0): any {
    return getExampleSlice(start, end).map(date => date.data);
}

function getActionExpect(actionName: string, start: number, end = 0, wrap = 2): any {
    return `${new Array(wrap).fill(`[`).join(``)}{"action":"${actionName}","data":[${getExampleSlice(start, end)
        .map(date => `${date.expected}`)
        .join(`,`)}]}${new Array(wrap).fill(`]`).join(``)}`;
}

describe(`ActionService`, () => {
    let service: ActionService;
    let http: MockHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ActionService, { provide: HttpService, useClass: MockHttpService }]
        });

        service = TestBed.inject(ActionService);
        http = TestBed.inject(HttpService) as unknown as MockHttpService;
    });

    it(`test sendRequests`, async () => {
        expect(
            JSON.stringify(await service.sendRequests([{ action: `arbitrary.action`, data: getActionData(1, 2) }]))
        ).toEqual(getActionExpect(`arbitrary.action`, 1, 2));
        expect(
            JSON.stringify(await service.sendRequests([{ action: `another.action`, data: getActionData(0, 3) }]))
        ).toEqual(getActionExpect(`another.action`, 0, 3));
        expect(http.lastPosts.every(post => post.path === ACTION_URL) && http.lastPosts.length === 2).toBe(true);
    });

    it(`test sendRequests with handle_separately`, async () => {
        expect(
            JSON.stringify(await service.sendRequests([{ action: `very.arbitrary`, data: getActionData(3, 6) }], true))
        ).toEqual(getActionExpect(`very.arbitrary`, 3, 6));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].path === ACTION_SEPARATELY_URL).toBe(true);
    });

    it(`test sendRequests errors`, async () => {
        await expectAsync(service.sendRequests([])).toBeRejectedWithError(
            `The action service did not return responses for each request.`
        );
        const actionPayload = [{ action: `majestically`, data: getActionData(6, 9) }];
        http.returnType = `error`;
        await expectAsync(service.sendRequests(actionPayload)).toBeRejectedWith(`Action majestically failed`);
        http.returnType = `too little`;
        await expectAsync(service.sendRequests(actionPayload)).toBeRejectedWithError(
            `The action service did not return responses for each request.`
        );
        http.returnType = `non-response`;
        await expectAsync(service.sendRequests(actionPayload)).toBeRejectedWithError(
            `Unknown return type from action service`
        );
        http.returnType = `nothing`;
        await expectAsync(service.sendRequests(actionPayload)).toBeResolvedTo(null);
        http.returnType = `no results`;
        await expectAsync(service.sendRequests(actionPayload)).toBeResolvedTo(null);
    });

    it(`test create`, async () => {
        const action = service.create<any>({ action: `an.action`, data: getActionData(7, 9) });
        expect(JSON.stringify(await action.resolve()) as string).toEqual(getActionExpect(`an.action`, 7, 9, 1));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].path === ACTION_URL).toBe(true);
    });

    it(`test createFromArray`, async () => {
        const action = service.createFromArray<any>([{ action: `action.movie`, data: getActionData(5, 7) }]);
        expect(JSON.stringify(await action.resolve()) as string).toEqual(getActionExpect(`action.movie`, 5, 7, 1));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].path === ACTION_URL).toBe(true);
    });

    it(`test beforeActionFunction`, async () => {
        const indices = [service.addBeforeActionFn(() => true)];
        expect(await service.sendRequests([{ action: `action.one`, data: getActionData(1, 2) }])).toBe(null);
        indices.push(service.addBeforeActionFn(() => false));
        expect(await service.sendRequests([{ action: `action.two`, data: getActionData(1, 4) }])).toBe(null);
        service.removeBeforeActionFn(indices[0]);
        expect(
            JSON.stringify(await service.sendRequests([{ action: `action.three`, data: getActionData(10, 12) }]))
        ).toBe(getActionExpect(`action.three`, 10, 12));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].data[0][`action`] === `action.three`).toBe(true);
    });
});

describe(`Action`, () => {
    let sendRequestsCalled: boolean;

    beforeEach(() => {
        sendRequestsCalled = false;
    });

    const requestFn = async requests => {
        sendRequestsCalled = true;
        return requests.map(rqst => rqst.action + `: ` + JSON.stringify(rqst.data));
    };
    const getAction = (...actions: ActionRequest[]) => new Action<string>(requestFn, actions);

    it(`test action base functionality`, async () => {
        const action = getAction({ action: `t3xt`, data: [4, `b`, `c`, `d`, 3] });
        expect(await action.resolve()).toEqual([`t3xt: [4,"b","c","d",3]`]);
        expect(sendRequestsCalled).toBe(true);
    });

    it(`test action from`, async () => {
        const actions = [
            getAction({ action: `50m3 t3xt`, data: [`f`, `g`, `h`, 1, `j`, `k`] }),
            getAction({ action: `some text`, data: [`l`, `m`, `n`] })
        ];
        const newAction = Action.from<string>(...actions);
        expect(await newAction.resolve()).toEqual([`50m3 t3xt: ["f","g","h",1,"j","k"]`, `some text: ["l","m","n"]`]);
        expect(sendRequestsCalled).toBe(true);
    });

    it(`test action from empty`, async () => {
        const newAction = Action.from<string>();
        expect(await newAction.resolve()).toEqual([]);
        expect(sendRequestsCalled).toBe(false);
    });

    it(`test action concat`, async () => {
        const action = getAction({ action: `1337`, data: [0, `p`, `q`, `r`, 5] });
        const actions = [
            getAction({ action: `t`, data: [`t`] }, { action: `u`, data: [`u`] }),
            createEmptyAction(),
            new Action(async () => {
                return [];
            }, [{ action: `letters`, data: [`v`, `w`, `x`] }]),
            null,
            { action: `yz`, data: [`y`, `z`] }
        ];
        const newAction = action.concat(...actions);
        expect(await newAction.resolve()).toEqual([
            `1337: [0,"p","q","r",5]`,
            `t: ["t"]`,
            `u: ["u"]`,
            `letters: ["v","w","x"]`,
            `yz: ["y","z"]`
        ]);
        expect(sendRequestsCalled).toBe(true);
    });

    it(`test action concat without data`, async () => {
        const action = getAction({ action: `1337`, data: [0, `p`, `q`, `r`, 5] });
        const newAction = action.concat();
        expect(await newAction.resolve()).toEqual([`1337: [0,"p","q","r",5]`]);
        expect(sendRequestsCalled).toBe(true);
    });

    it(`test action with empty sendRequest return value`, async () => {
        const action = new Action<string>(async () => null, [{ action: `t3xt`, data: [4, `b`, `c`, `d`, 3] }]);
        expect(await action.resolve()).toEqual(undefined);
        const secondAction = new Action<string>(
            async () => undefined,
            [{ action: `t3xt`, data: [4, `b`, `c`, `d`, 3] }]
        );
        expect(await secondAction.resolve()).toEqual(undefined);
    });
});
