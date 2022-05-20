import { TestBed } from '@angular/core/testing';

import { ProjectorCountdownRepositoryService } from './projector-countdown-repository.service';

describe(`ProjectorCountdownRepositoryService`, () => {
    let service: ProjectorCountdownRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorCountdownRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
