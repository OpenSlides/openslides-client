import { TestBed } from '@angular/core/testing';

import { MotionWorkflowControllerService } from './motion-workflow-controller.service';

xdescribe(`MotionWorkflowControllerService`, () => {
    let service: MotionWorkflowControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionWorkflowControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
