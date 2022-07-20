import { TestBed } from '@angular/core/testing';

import { WaitForActionDialogService } from './wait-for-action-dialog.service';

describe(`WaitForActionDialogService`, () => {
    let service: WaitForActionDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitForActionDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
