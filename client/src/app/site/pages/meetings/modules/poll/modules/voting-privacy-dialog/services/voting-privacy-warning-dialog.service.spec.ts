import { TestBed } from '@angular/core/testing';

import { VotingPrivacyWarningDialogService } from './voting-privacy-warning-dialog.service';

xdescribe(`VotingPrivacyWarningDialogService`, () => {
    let service: VotingPrivacyWarningDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VotingPrivacyWarningDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
