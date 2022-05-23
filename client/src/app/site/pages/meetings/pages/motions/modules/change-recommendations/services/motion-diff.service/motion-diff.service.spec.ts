import { TestBed } from '@angular/core/testing';

import { MotionDiffService } from './motion-diff.service';

describe(`MotionDiffService`, () => {
    let service: MotionDiffService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionDiffService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
