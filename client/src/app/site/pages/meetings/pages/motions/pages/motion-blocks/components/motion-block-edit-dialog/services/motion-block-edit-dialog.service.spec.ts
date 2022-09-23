import { TestBed } from '@angular/core/testing';

import { MotionBlockEditDialogService } from './motion-block-edit-dialog.service';

xdescribe(`MotionBlockEditDialogService`, () => {
    let service: MotionBlockEditDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockEditDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
