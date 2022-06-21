import { TestBed } from '@angular/core/testing';

import { ErrorMapService } from './error-map.service';

describe(`ErrorMapService`, () => {
    let service: ErrorMapService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ErrorMapService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
