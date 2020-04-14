import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { ProjectiondefaultRepositoryService } from './projection-default-repository.service';

describe('ProjectionDefaultRepositoryService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [ProjectiondefaultRepositoryService]
        })
    );

    it('should be created', inject(
        [ProjectiondefaultRepositoryService],
        (service: ProjectiondefaultRepositoryService) => {
            expect(service).toBeTruthy();
        }
    ));
});
