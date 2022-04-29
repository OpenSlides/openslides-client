import { TestBed } from '@angular/core/testing';

import { ProjectorMessageRepositoryService } from './projector-message-repository.service';

describe('ProjectorMessageRepositoryService', () => {
    let service: ProjectorMessageRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorMessageRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
