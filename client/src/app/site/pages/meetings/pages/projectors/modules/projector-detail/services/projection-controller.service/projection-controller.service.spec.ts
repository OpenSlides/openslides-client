import { TestBed } from '@angular/core/testing';

import { ProjectionControllerService } from './projection-controller.service';

describe('ProjectionControllerService', () => {
    let service: ProjectionControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectionControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
