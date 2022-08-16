import { TestBed } from '@angular/core/testing';

import { ThemeControllerService } from './theme-controller.service';

xdescribe(`ThemeControllerService`, () => {
    let service: ThemeControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
