import { TestBed } from '@angular/core/testing';

import { AccountImportService } from './account-import.service';

xdescribe(`AccountImportService`, () => {
    let service: AccountImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountImportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
