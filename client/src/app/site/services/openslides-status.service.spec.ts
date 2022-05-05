import { TestBed } from '@angular/core/testing';

import { OpenSlidesStatusService } from './openslides-status.service';

describe('OpenSlidesStatusService', () => {
    let service: OpenSlidesStatusService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OpenSlidesStatusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
