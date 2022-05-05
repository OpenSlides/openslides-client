import { TestBed } from '@angular/core/testing';

import { OrganizationControllerService } from './organization-controller.service';

describe('OrganizationControllerService', () => {
    let service: OrganizationControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
