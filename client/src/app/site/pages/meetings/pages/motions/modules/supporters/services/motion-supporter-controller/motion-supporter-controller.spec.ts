import { TestBed } from '@angular/core/testing';

import { MotionSupporterControllerService } from './motion-supporter-controller.service';

xdescribe(`MotionSupporterControllerService`, () => {
    let service: MotionSupporterControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionSupporterControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
