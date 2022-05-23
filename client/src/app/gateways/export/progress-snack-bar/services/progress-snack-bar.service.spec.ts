import { TestBed } from '@angular/core/testing';

import { ProgressSnackBarService } from './progress-snack-bar.service';

describe(`ProgressSnackBarService`, () => {
    let service: ProgressSnackBarService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProgressSnackBarService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
