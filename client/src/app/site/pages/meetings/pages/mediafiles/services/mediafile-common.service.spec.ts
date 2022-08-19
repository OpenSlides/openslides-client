import { TestBed } from '@angular/core/testing';

import { MediafileCommonService } from './mediafile-common.service';

describe(`MediafileCommonService`, () => {
    let service: MediafileCommonService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileCommonService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
