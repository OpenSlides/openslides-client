import { TestBed } from '@angular/core/testing';

import { MotionMultiselectService } from './motion-multiselect.service';

describe('MotionMultiselectService', () => {
    let service: MotionMultiselectService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionMultiselectService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
