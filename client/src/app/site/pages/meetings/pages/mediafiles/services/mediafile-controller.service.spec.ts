import { TestBed } from '@angular/core/testing';

import { MediafileControllerService } from './mediafile-controller.service';

describe(`MediafileControllerService`, () => {
    let service: MediafileControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
