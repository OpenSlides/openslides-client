import { TestBed } from '@angular/core/testing';

import { TagControllerService } from './tag-controller.service';

xdescribe(`TagControllerService`, () => {
    let service: TagControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TagControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
