import { TestBed } from '@angular/core/testing';

import { OrganizationTagRepositoryService } from './organization-tag-repository.service';

describe(`OrganizationTagRepositoryService`, () => {
    let service: OrganizationTagRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationTagRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
