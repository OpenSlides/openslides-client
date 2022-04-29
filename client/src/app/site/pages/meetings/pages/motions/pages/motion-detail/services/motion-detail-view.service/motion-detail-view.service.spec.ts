import { TestBed } from '@angular/core/testing';

import { MotionDetailViewService } from './motion-detail-view.service';

describe('MotionDetailViewService', () => {
    let service: MotionDetailViewService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionDetailViewService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
