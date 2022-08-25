import { TestBed } from '@angular/core/testing';

import { OpenSlidesRouterService } from './openslides-router.service';

xdescribe(`OpenslidesRouterService`, () => {
    let service: OpenSlidesRouterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenSlidesRouterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
