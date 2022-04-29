import { TestBed } from '@angular/core/testing';

import { MotionBlockControllerService } from './motion-block-controller.service';

describe('MotionBlockControllerService', () => {
    let service: MotionBlockControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
