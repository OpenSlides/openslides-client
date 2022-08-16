import { TestBed } from '@angular/core/testing';

import { MotionForwardDialogService } from './motion-forward-dialog.service';

xdescribe(`MotionForwardDialogService`, () => {
    let service: MotionForwardDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionForwardDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
