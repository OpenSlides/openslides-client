import { TestBed } from '@angular/core/testing';

import { AccountExportService } from './account-export.service';

describe('AccountExportService', () => {
    let service: AccountExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
