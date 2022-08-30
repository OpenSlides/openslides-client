import { TestBed } from '@angular/core/testing';

import { MotionRepositoryService } from './motion-repository.service';

xdescribe(`MotionRepositoryService`, () => {
    let service: MotionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
