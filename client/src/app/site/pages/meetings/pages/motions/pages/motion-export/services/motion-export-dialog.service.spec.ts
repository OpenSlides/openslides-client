import { TestBed } from '@angular/core/testing';

import { MotionExportDialogService } from './motion-export-dialog.service';

xdescribe(`MotionExportDialogService`, () => {
    let service: MotionExportDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionExportDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
