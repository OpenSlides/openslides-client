import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { OrganisationSettingsService } from './organisation-settings.service';

describe('OrganisationSettingsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [OrganisationSettingsService]
        });
    });

    it('should be created', inject([OrganisationSettingsService], (service: OrganisationSettingsService) => {
        expect(service).toBeTruthy();
    }));
});
