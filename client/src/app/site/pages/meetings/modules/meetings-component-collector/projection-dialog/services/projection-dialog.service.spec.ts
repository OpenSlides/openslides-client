import { TestBed } from '@angular/core/testing';

import { ProjectionDialogService } from './projection-dialog.service';

xdescribe(`ProjectionDialogService`, () => {
    let service: ProjectionDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectionDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
