import { TestBed } from '@angular/core/testing';

import { ExportDialogService } from './export-dialog.service';

describe(`ExportDialogService`, () => {
    let service: ExportDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
