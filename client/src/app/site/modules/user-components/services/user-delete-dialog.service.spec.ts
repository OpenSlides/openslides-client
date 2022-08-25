import { TestBed } from '@angular/core/testing';

import { UserDeleteDialogService } from './user-delete-dialog.service';

xdescribe(`UserDeleteDialogService`, () => {
    let service: UserDeleteDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserDeleteDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
