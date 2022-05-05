import { TestBed } from '@angular/core/testing';

import { MotionStateControllerService } from './motion-state-controller.service';

describe('MotionStateControllerService', () => {
    let service: MotionStateControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionStateControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
