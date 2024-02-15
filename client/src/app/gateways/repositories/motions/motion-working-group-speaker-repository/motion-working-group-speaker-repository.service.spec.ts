import { TestBed } from '@angular/core/testing';

import { MotionWorkingGroupSpeakerRepositoryService } from './motion-working-group-speaker-repository.service';

xdescribe(`MotionWorkingGroupSpeakerRepositoryService`, () => {
    let service: MotionWorkingGroupSpeakerRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionWorkingGroupSpeakerRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
