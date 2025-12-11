import { TestBed } from '@angular/core/testing';

import { MotionSupporterRepositoryService } from './motion-supporter-repository.service';

xdescribe(`MotionSupporterRepositoryService`, () => {
    let service: MotionSupporterRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionSupporterRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
