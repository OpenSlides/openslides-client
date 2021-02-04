import { TestBed } from '@angular/core/testing';

import { MotionViewService } from './motion-view.service';

describe('MotionViewService', () => {
    let service: MotionViewService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionViewService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
