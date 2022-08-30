import { TestBed } from '@angular/core/testing';

import { AssignmentPollDialogService } from './assignment-poll-dialog.service';

xdescribe(`AssignmentPollDialogService`, () => {
    let service: AssignmentPollDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentPollDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
