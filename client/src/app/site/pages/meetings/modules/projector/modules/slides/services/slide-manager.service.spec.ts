import { TestBed } from '@angular/core/testing';

import { SlideManagerService } from './slide-manager.service';

xdescribe(`SlideManagerService`, () => {
    let service: SlideManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SlideManagerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
