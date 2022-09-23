import { TestBed } from '@angular/core/testing';

import { ProgressSnackBarControlService } from './progress-snack-bar-control.service';

xdescribe(`ProgressSnackBarControlService`, () => {
    let service: ProgressSnackBarControlService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProgressSnackBarControlService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
