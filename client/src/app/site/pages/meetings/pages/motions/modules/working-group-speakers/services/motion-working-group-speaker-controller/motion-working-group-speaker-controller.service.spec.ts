import { TestBed } from '@angular/core/testing';

import { MotionWorkingGroupSpeakerControllerService } from './motion-working-group-speaker-controller.service';

xdescribe(`MotionWorkingGroupSpeakerControllerService`, () => {
    let service: MotionWorkingGroupSpeakerControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionWorkingGroupSpeakerControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
