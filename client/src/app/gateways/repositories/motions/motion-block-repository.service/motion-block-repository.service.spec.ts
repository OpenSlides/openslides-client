import { TestBed } from '@angular/core/testing';

import { MotionBlockRepositoryService } from './motion-block-repository.service';

xdescribe(`MotionBlockRepositoryService`, () => {
    let service: MotionBlockRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
