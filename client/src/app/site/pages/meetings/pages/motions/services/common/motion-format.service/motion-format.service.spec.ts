import { TestBed } from '@angular/core/testing';

import { MotionFormatService } from './motion-format.service';

describe(`MotionFormatService`, () => {
    let service: MotionFormatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionFormatService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
