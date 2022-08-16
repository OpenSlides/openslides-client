import { TestBed } from '@angular/core/testing';

import { OpenSlidesService } from './openslides.service';

xdescribe(`OpenSlidesService`, () => {
    let service: OpenSlidesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenSlidesService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
