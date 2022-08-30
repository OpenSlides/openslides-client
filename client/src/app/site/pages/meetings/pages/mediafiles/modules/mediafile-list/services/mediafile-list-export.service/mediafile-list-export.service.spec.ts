import { TestBed } from '@angular/core/testing';

import { MediafileListExportService } from './mediafile-list-export.service';

xdescribe(`MediafileListExportService`, () => {
    let service: MediafileListExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileListExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
