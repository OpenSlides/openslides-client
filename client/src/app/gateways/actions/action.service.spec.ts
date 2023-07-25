import { TestBed } from '@angular/core/testing';

import { HttpService } from '../http.service';
import { UserAction } from '../repositories/users/user-action';
import { ActionService } from './action.service';
import { ActionRequest } from './action-utils';

class MockHttpService {
    public wrap = true;

    public constructor() {}

    public async post<T>(path: string, data: any): Promise<T> {
        return (this.wrap
            ? [`${path} | ${JSON.stringify(data)}`]
            : `${path} | ${JSON.stringify(data)}`) as unknown as T;
    }
}

function func() {
    return true;
}

interface HttpResponse {
    success: false;
    message: string;
    error_index?: number;
}

class HttpServiceMock {
    public wrap = true;

    public constructor() {}

    public async post<T>(path: string, data?: any): Promise<T> {
        let url = path;
        let result: HttpResponse = {
            success: false,
            message: `Action was not fast enough`
        };
        return result as unknown as T;
    }
}

fdescribe(`Service: ActionService`, () => {
    let httpServiceSpy: jasmine.SpyObj<HttpService>;
    let service: ActionService;
    let actionRequest: [ActionRequest];

    let http: MockHttpService;

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
            imports: [MockHttpService],
            providers: [ActionService, { provide: HttpService, useClass: MockHttpService }]
        });

        httpServiceSpy = jasmine.createSpyObj(`MockHttpService`, [`post`]);
        service = TestBed.inject(ActionService);
        //service = new ActionService(httpServiceSpy);
        actionRequest = [{ action: `POST`, data: [1, 2] }];
    });

    it(`method: addBeforeActionFn and removeBeforeActionFn, test if function was saved and deleted`, () => {
        let id = service.addBeforeActionFn(func);
        expect(service.removeBeforeActionFn(id)).toEqual(undefined);
    });

    it(`method: sendRequests`, async () => {
        /** #############################################
         let id = service.addBeforeActionFn(func);
         expect(await service.sendRequests<string>(actionRequest)).toBe(null);
         httpServiceSpy.post.and.returnValue(Promise.resolve());
         service.removeBeforeActionFn(id);
         await expectAsync(service.sendRequests(actionRequest)).toBeRejectedWithError(
             `Unknown return type from action service`
         );
         ############################### */
        //actionRequest = [{ action: `user.delete`, data: [{ id: 5944 }] }];
        actionRequest = [{ action: UserAction.DELETE, data: [{ id: 5944 }] }];
        await expectAsync(service.sendRequests(actionRequest)).toBeRejectedWithError(
            `The action service did not return responses for each request.`
        );
        //expect(await service.sendRequests(actionRequest)).toThrowError(`The action service did not return responses for each request.`);
        //expect(await service.sendRequests(actionRequest, true)).toEqual(null);
    });

    // it(`method: createFromArray`, async () => {
    //     expect(await service.sendRequests<string>(actionRequest)).toBeTruthy();
    //     expect(await service.sendRequests<string>(actionRequest, true)).toBeTruthy();
    // });
});
