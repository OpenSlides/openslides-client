import { TestBed } from '@angular/core/testing';

import { AssignmentCandidateRepositoryService } from './assignment-candidate-repository.service';

xdescribe(`AssignmentCandidateRepositoryService`, () => {
    let service: AssignmentCandidateRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentCandidateRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
