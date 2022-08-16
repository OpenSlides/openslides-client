import { TestBed } from '@angular/core/testing';

import { ArchiveStatusService } from './archive-status.service';

xdescribe(`ArchiveStatusService`, () => {
    let service: ArchiveStatusService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ArchiveStatusService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
