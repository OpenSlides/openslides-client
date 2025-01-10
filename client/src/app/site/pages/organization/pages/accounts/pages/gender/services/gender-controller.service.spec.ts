import { TestBed } from '@angular/core/testing';

import { GenderControllerService } from './gender-controller.service';

xdescribe(`GenderControllerService`, () => {
    let service: GenderControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GenderControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
