import { TestBed } from '@angular/core/testing';

import { MediafileListGroupService } from './mediafile-list-group.service';

xdescribe(`MediafileListGroupService`, () => {
    let service: MediafileListGroupService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileListGroupService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
