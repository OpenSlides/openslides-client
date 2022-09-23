import { TestBed } from '@angular/core/testing';

import { AssignmentExportService } from './assignment-export.service';

xdescribe(`AssignmentExportService`, () => {
    let service: AssignmentExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
