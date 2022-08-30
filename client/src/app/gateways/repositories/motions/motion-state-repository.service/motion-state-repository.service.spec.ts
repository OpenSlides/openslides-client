import { TestBed } from '@angular/core/testing';

import { MotionStateRepositoryService } from './motion-state-repository.service';

xdescribe(`MotionStateRepositoryService`, () => {
    let service: MotionStateRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionStateRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
