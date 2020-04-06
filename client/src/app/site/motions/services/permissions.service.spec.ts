import { TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [E2EImportsModule] }));

    it('should be created', () => {
        const service: PermissionsService = TestBed.get(PermissionsService);
        expect(service).toBeTruthy();
    });
});
