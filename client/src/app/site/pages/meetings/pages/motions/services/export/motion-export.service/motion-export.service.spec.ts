import { TestBed } from '@angular/core/testing';

import { MotionExportService } from './motion-export.service';

describe(`MotionExportService`, () => {
    let service: MotionExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
