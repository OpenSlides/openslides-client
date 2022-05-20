import { TestBed } from '@angular/core/testing';

import { FileExportService } from './file-export.service';

describe(`FileExportService`, () => {
    let service: FileExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FileExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
