import { TestBed } from '@angular/core/testing';

import { MediaManageService } from './media-manage.service';

xdescribe(`MediaManageService`, () => {
    let service: MediaManageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediaManageService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
