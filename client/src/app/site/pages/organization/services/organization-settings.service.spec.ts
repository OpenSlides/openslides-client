import { TestBed } from '@angular/core/testing';

import { OrganizationSettingsService } from './organization-settings.service';

xdescribe(`OrganizationSettingsService`, () => {
    let service: OrganizationSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganizationSettingsService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
