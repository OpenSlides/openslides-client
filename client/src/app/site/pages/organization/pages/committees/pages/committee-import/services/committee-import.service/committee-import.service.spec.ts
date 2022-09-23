import { TestBed } from '@angular/core/testing';

import { CommitteeImportService } from './committee-import.service';

xdescribe(`CommitteeImportService`, () => {
    let service: CommitteeImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeImportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
