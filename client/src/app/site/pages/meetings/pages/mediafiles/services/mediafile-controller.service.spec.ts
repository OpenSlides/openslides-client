import { TestBed } from '@angular/core/testing';

import { MediafileControllerService } from './mediafile-controller.service';

xdescribe(`MediafileControllerService`, () => {
    let service: MediafileControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
