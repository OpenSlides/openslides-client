import { TestBed } from '@angular/core/testing';

import { MotionSubmitterControllerService } from './motion-submitter-controller.service';

xdescribe(`MotionSubmitterControllerService`, () => {
    let service: MotionSubmitterControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionSubmitterControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
