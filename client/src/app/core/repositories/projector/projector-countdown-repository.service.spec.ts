import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { ProjectorCountdownRepositoryService } from './projector-countdown-repository.service';

describe('CountdownRepositoryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [ProjectorCountdownRepositoryService]
        });
    });

    it('should be created', inject(
        [ProjectorCountdownRepositoryService],
        (service: ProjectorCountdownRepositoryService) => {
            expect(service).toBeTruthy();
        }
    ));
});
