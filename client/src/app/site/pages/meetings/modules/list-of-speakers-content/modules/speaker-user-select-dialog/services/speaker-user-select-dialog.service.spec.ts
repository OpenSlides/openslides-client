import { TestBed } from '@angular/core/testing';

import { SpeakerUserSelectDialogService } from './speaker-user-select-dialog.service';

xdescribe(`SpeakerUserSelectDialogService`, () => {
    let service: SpeakerUserSelectDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SpeakerUserSelectDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
