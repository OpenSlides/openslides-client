import { TestBed } from '@angular/core/testing';

import { MotionControllerService } from './motion-controller.service';

describe(`MotionControllerService`, () => {
    let service: MotionControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
