import { TestBed } from '@angular/core/testing';

import { OrganizationSettingsService } from './organization-settings.service';

describe(`OrganizationSettingsService`, () => {
    let service: OrganizationSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationSettingsService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
