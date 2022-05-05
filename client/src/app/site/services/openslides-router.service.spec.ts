import { TestBed } from '@angular/core/testing';

import { OpenSlidesRouterService } from './openslides-router.service';

describe('OpenslidesRouterService', () => {
    let service: OpenSlidesRouterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenSlidesRouterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
