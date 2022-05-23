import { TestBed } from '@angular/core/testing';

import { ProjectorMessageDialogService } from './projector-message-dialog.service';

describe(`ProjectorMessageDialogService`, () => {
    let service: ProjectorMessageDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorMessageDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
