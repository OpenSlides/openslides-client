import { TestBed } from '@angular/core/testing';

import { VotingCryptographyInfoDialogService } from './voting-cryptography-info-dialog.service';

xdescribe(`VotingCryptographyInfoDialogService`, () => {
    let service: VotingCryptographyInfoDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VotingCryptographyInfoDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
