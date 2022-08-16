import { TestBed } from '@angular/core/testing';

import { MotionPollDialogService } from './motion-poll-dialog.service';

xdescribe(`MotionPollDialogService`, () => {
    let service: MotionPollDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPollDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
