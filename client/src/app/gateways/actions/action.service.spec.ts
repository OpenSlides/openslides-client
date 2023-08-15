import { TestBed } from '@angular/core/testing';
import { QueryParams } from 'src/app/infrastructure/definitions/http';

import { HttpService } from '../http.service';
import { ActionService } from './action.service';
import { ActionResponse } from './action-utils';

class MockHttpService {
    public lastPosts: { path: string; data: any; queryParams: QueryParams }[] = [];

    public constructor() {}

    public async post<R>(path: string, data: any, queryParams: QueryParams): Promise<R> {
        this.lastPosts.push({ path, data, queryParams });
        // if (
        //     path !== `/system/autoupdate/history_information` ||
        //     Object.keys(queryParams).length !== 1 ||
        //     !queryParams[`fqid`]
        // ) {
        //     throw new Error(`Parameters for http post had incorrect data`);
        // }
        return this.wrapInActionResponse([[data]]) as unknown as R;
    }

    private wrapInActionResponse<R>(data?: ((R | null)[] | null)[]): ActionResponse<R> {
        return {
            success: true,
            message: `Actions handeled successfully`,
            results: data
        };
    }
}

const exampleData = [
    { title: `undefined`, data: undefined, expected: `` },
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

function getActionExpect(actionName: string, start: number, end: number = 0): any {
    return `[[{"action":"${actionName}","data":[${getExampleSlice(start, end)
        .map(date => `${date.expected}`)
        .join(`,`)}]}]]`;
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
            JSON.stringify(await service.sendRequests([{ action: `arbitrary.action`, data: getActionData(1, 3) }]))
        ).toEqual(getActionExpect(`arbitrary.action`, 1, 3));
    });

    // it(`test sendRequests with handle_separately`, () => {
    //     service.sendRequests([{ action: `arbitrary.action`, data: [] }], true);
    // });

    // it(`test create`, () => {});

    // it(`test createFromArray`, () => {});

    // it(`test beforeActionFunction`, () => {});
});
