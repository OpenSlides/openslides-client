import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { MotionStateRepositoryService } from './motion-state-repository.service';

describe('MotionStateRepositoryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [MotionStateRepositoryService]
        });
    });

    it('should be created', inject([MotionStateRepositoryService], (service: MotionStateRepositoryService) => {
        expect(service).toBeTruthy();
    }));
});
