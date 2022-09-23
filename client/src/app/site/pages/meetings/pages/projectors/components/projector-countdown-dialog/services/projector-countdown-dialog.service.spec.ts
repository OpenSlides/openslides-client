import { TestBed } from '@angular/core/testing';

import { ProjectorCountdownDialogService } from './projector-countdown-dialog.service';

xdescribe(`ProjectorCountdownDialogService`, () => {
    let service: ProjectorCountdownDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorCountdownDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
