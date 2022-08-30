import { TestBed } from '@angular/core/testing';

import { ProjectorEditDialogService } from './projector-edit-dialog.service';

xdescribe(`ProjectorEditDialogService`, () => {
    let service: ProjectorEditDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorEditDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
