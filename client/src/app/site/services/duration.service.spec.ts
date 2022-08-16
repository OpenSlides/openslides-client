import { TestBed } from '@angular/core/testing';

import { DurationService } from './duration.service';

xdescribe(`DurationService`, () => {
    let service: DurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DurationService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
