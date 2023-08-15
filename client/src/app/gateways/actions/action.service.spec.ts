import { TestBed } from '@angular/core/testing';
import { QueryParams } from 'src/app/infrastructure/definitions/http';

import { HttpService } from '../http.service';
import { ActionService } from './action.service';
import { ActionError, ActionResponse } from './action-utils';

const ACTION_URL = `/system/action/handle_request`;
const ACTION_SEPARATELY_URL = `/system/action/handle_separately`;

class MockHttpService {
    public lastPosts: { path: string; data: any; queryParams: QueryParams }[] = [];

    public returnType: `response` | `error` | `nothing` | `too little` | `non-response` = `response`;

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
    { title: `undefined`, data: undefined, expected: `null` },
    { title: `null`, data: null, expected: `null` },
    { title: `'0'`, data: 0, expected: `0` },
    { title: `positive integer`, data: 1, expected: `1` },
    { title: `negative integer`, data: -2, expected: `-2` },
    { title: `NaN`, data: Number.NaN, expected: `null` },
    { title: `infinity`, data: Number.POSITIVE_INFINITY, expected: `null` },
    { title: `a string`, data: `a`, expected: `"a"` },
    { title: `an empty string`, data: ``, expected: `""` },
    { title: `a string containing a number`, data: `1`, expected: `"1"` },
    { title: `an object`, data: { a: 1 }, expected: `{"a":1}` },
    { title: `an empty object`, data: {}, expected: `{}` },
    { title: `an array`, data: [1, 2, 3], expected: `[1,2,3]` },
    { title: `an empty array`, data: [], expected: `[]` }
];

function getExampleSlice(start: number, end: number = 0): any {
    start = start % exampleData.length;
    end = end % (exampleData.length + 1);
    return start >= end ? exampleData.slice(start) : exampleData.slice(start, end);
}

function getActionData(start: number, end: number = 0): any {
    return getExampleSlice(start, end).map(date => date.data);
}

function getActionExpect(actionName: string, start: number, end: number = 0, wrap = 2): any {
    return `${new Array(wrap).fill(`[`).join(``)}{"action":"${actionName}","data":[${getExampleSlice(start, end)
        .map(date => `${date.expected}`)
        .join(`,`)}]}${new Array(wrap).fill(`]`).join(``)}`;
}

fdescribe(`ActionService`, () => {
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
    });

    it(`test create`, async () => {
        let action = service.create<any>({ action: `arbitrary.action`, data: getActionData(1, 2) });
        expect(JSON.stringify(await action.resolve()) as string).toEqual(getActionExpect(`arbitrary.action`, 1, 2, 1));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].path === ACTION_URL).toBe(true);
    });

    it(`test createFromArray`, async () => {
        let action = service.createFromArray<any>([{ action: `arbitrary.action`, data: getActionData(1, 2) }]);
        expect(JSON.stringify(await action.resolve()) as string).toEqual(getActionExpect(`arbitrary.action`, 1, 2, 1));
        expect(http.lastPosts.length === 1 && http.lastPosts[0].path === ACTION_URL).toBe(true);
    });
});

// it(`test beforeActionFunction`, async () => {});
