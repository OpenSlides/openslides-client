import { TestBed } from '@angular/core/testing';

import { ApplauseService } from './applause.service';

describe(`ApplauseService`, () => {
    let service: ApplauseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ApplauseService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
