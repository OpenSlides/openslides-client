import { TestBed } from '@angular/core/testing';

import { MotionWorkflowRepositoryService } from '.';

describe('MotionWorkflowRepositoryService', () => {
    let service: MotionWorkflowRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionWorkflowRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
