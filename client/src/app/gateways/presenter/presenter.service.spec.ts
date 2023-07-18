import { TestBed } from '@angular/core/testing';

import { HttpService } from '../http.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

class MockHttpService {
    public wrap = true;

    public constructor() {}

    public async post<R>(path: string, data: any): Promise<R> {
        return (this.wrap
            ? [`${path} | ${JSON.stringify(data)}`]
            : `${path} | ${JSON.stringify(data)}`) as unknown as R;
    }
}

export class MockPresenterService {
    public returnValueFns = new Map<Presenter, (data?: any) => { error?: string; returnValue?: any }>();

    public constructor() {}

    public async call<R, D = any>(presenter: Presenter, data?: D): Promise<R> {
        const fn: (data?: any) => { error?: string; returnValue?: any } =
            this.returnValueFns.get(presenter) ??
            (() => ({ error: `MockPresenterService: Called unexpected presenter` }));
        const returnValue = fn(data);
        if (returnValue.error) {
            throw new Error(returnValue.error);
        }
        return returnValue.returnValue;
    }
}

describe(`PresenterService`, () => {
    let service: PresenterService;
    let http: MockHttpService;

    const presenterNames = Object.values(Presenter);
    const exampleData = [
        { title: `undefined`, data: undefined, expected: `` },
        { title: `null`, data: null, expected: `,"data":null` },
        { title: `'0'`, data: 0, expected: `,"data":0` },
        { title: `positive integer`, data: 1, expected: `,"data":1` },
        { title: `negative integer`, data: -2, expected: `,"data":-2` },
        { title: `NaN`, data: Number.NaN, expected: `,"data":null` },
        { title: `infinity`, data: Number.POSITIVE_INFINITY, expected: `,"data":null` },
        { title: `a string`, data: `a`, expected: `,"data":"a"` },
        { title: `an empty string`, data: ``, expected: `,"data":""` },
        { title: `a string containing a number`, data: `1`, expected: `,"data":"1"` },
        { title: `an object`, data: { a: 1 }, expected: `,"data":{"a":1}` },
        { title: `an empty object`, data: {}, expected: `,"data":{}` },
        { title: `an array`, data: [1, 2, 3], expected: `,"data":[1,2,3]` },
        { title: `an empty array`, data: [], expected: `,"data":[]` }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PresenterService, { provide: HttpService, useClass: MockHttpService }]
        });

        service = TestBed.inject(PresenterService);
        http = TestBed.inject(HttpService) as unknown as MockHttpService;
    });

    for (let i = 0; i < Math.max(presenterNames.length, exampleData.length); i++) {
        const name = presenterNames[i % presenterNames.length];
        const data = exampleData[i % exampleData.length];
        it(`does nothing strange for "${name}" presenter with ${data.title}`, async () => {
            await expectAsync(service.call(name, data.data)).toBeResolvedTo(
                `/system/presenter/handle_request | [{"presenter":"${name}"${data.expected}}]`
            );
        });
    }

    it(`handles wrong return value with error`, async () => {
        http.wrap = !http.wrap;
        await expectAsync(service.call(Presenter.GET_USERS, { some: `data` })).toBeRejectedWithError(
            `The presenter service has returned a wrong format`
        );
        http.wrap = !http.wrap;
    });
});
