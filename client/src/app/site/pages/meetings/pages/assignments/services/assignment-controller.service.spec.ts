import { TestBed } from '@angular/core/testing';

import { AssignmentControllerService } from './assignment-controller.service';

describe(`AssignmentControllerService`, () => {
    let service: AssignmentControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
