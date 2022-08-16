import { TestBed } from '@angular/core/testing';

import { MotionListInfoDialogService } from './motion-list-info-dialog.service';

xdescribe(`MotionListInfoDialogService`, () => {
    let service: MotionListInfoDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionListInfoDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
