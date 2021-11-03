import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { MotionWorkflowRepositoryService } from './motion-workflow-repository.service';

describe(`MotionWorkflowRepositoryService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [MotionWorkflowRepositoryService]
        });
    });

    it(`should be created`, inject([MotionWorkflowRepositoryService], (service: MotionWorkflowRepositoryService) => {
        expect(service).toBeTruthy();
    }));
});
