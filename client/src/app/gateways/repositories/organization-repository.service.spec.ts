import { TestBed } from '@angular/core/testing';

import { OrganizationRepositoryService } from './organization-repository.service';

xdescribe(`OrganizationRepositoryService`, () => {
    let service: OrganizationRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
