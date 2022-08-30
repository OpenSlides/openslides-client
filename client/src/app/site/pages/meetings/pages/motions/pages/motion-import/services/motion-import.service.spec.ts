import { TestBed } from '@angular/core/testing';

import { MotionImportService } from './motion-import.service';

xdescribe(`MotionImportService`, () => {
    let service: MotionImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionImportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
