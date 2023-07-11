import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { QueryParams } from 'src/app/infrastructure/definitions/http';

import { HttpService } from '../http.service';
import { ActionService } from './action.service';

class HttpServiceMock {
    public async post(path: string, data?: any, queryParams?: QueryParams, header?: HttpHeaders): Promise<any> {
        return null;
    }
}

function func() {
    return true;
}

fdescribe(`Service: ActionService`, () => {
    let httpServiceSpy: jasmine.SpyObj<HttpService>;
    let service: ActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpServiceMock],
            providers: [ActionService, { provide: HttpService, useClass: HttpServiceMock }]
        });

        httpServiceSpy = jasmine.createSpyObj(`HttpService`, [`post`]);
        service = new ActionService(httpServiceSpy);
    });

    it(`method: addBeforeActionFn and removeBeforeActionFn, test if function was savedd and deleted`, () => {
        let id = service.addBeforeActionFn(func);
        expect(service.removeBeforeActionFn(id)).toEqual(undefined);
    });

    it(`method: sendRequests`, () => {
        httpServiceSpy.post.and.returnValue(Promise.resolve());
        expect(service).toBeTruthy();
    });

    it(`method: createFromArray`, () => {
        expect(service).toBeTruthy();
    });
});
