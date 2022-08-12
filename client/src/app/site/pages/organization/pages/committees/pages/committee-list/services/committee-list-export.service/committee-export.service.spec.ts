import { TestBed } from '@angular/core/testing';

import { CommitteeExportService } from './committee-export.service';

xdescribe(`CommitteeExportService`, () => {
    let service: CommitteeExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
