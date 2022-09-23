import { TestBed } from '@angular/core/testing';

import { MotionBlockCreateDialogService } from './motion-block-create-dialog.service';

xdescribe(`MotionBlockCreateDialogService`, () => {
    let service: MotionBlockCreateDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockCreateDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
