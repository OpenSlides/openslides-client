import { TestBed } from '@angular/core/testing';

import { MotionSubmitterRepositoryService } from './motion-submitter-repository.service';

xdescribe(`MotionSubmitterRepositoryService`, () => {
    let service: MotionSubmitterRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionSubmitterRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
