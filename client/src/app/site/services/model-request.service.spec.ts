import { TestBed } from '@angular/core/testing';

import { ModelRequestService } from './model-request.service';

xdescribe(`ModelRequestService`, () => {
    let service: ModelRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModelRequestService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
