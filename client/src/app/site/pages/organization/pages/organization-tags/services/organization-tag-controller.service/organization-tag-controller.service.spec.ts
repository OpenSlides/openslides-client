import { TestBed } from '@angular/core/testing';

import { OrganizationTagControllerService } from './organization-tag-controller.service';

xdescribe(`OrganizationTagControllerService`, () => {
    let service: OrganizationTagControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationTagControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
