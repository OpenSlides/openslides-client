import { TestBed } from '@angular/core/testing';

import { AssignmentCandidateControllerService } from './assignment-candidate-controller.service';

xdescribe(`AssignmentCandidateControllerService`, () => {
    let service: AssignmentCandidateControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentCandidateControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
