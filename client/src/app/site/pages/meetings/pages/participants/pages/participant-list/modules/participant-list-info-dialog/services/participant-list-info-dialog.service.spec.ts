import { TestBed } from '@angular/core/testing';

import { ParticipantListInfoDialogService } from './participant-list-info-dialog.service';

xdescribe(`ParticipantListInfoDialogService`, () => {
    let service: ParticipantListInfoDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ParticipantListInfoDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
