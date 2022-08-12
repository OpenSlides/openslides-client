import { TestBed } from '@angular/core/testing';

import { CallRestrictionService } from './call-restriction.service';

xdescribe(`CallRestrictionService`, () => {
    let service: CallRestrictionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CallRestrictionService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
