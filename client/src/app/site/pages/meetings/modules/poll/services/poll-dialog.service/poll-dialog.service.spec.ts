import { TestBed } from '@angular/core/testing';

import { PollDialogService } from './poll-dialog.service';

xdescribe(`PollDialogService`, () => {
    let service: PollDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
