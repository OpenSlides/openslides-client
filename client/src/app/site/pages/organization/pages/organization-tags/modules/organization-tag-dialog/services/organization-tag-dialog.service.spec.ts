import { TestBed } from '@angular/core/testing';

import { OrganizationTagDialogService } from './organization-tag-dialog.service';

xdescribe(`OrganizationTagDialogService`, () => {
    let service: OrganizationTagDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationTagDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
