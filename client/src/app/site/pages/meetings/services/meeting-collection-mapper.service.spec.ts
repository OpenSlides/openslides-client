import { TestBed } from '@angular/core/testing';

import { MeetingCollectionMapperService } from './meeting-collection-mapper.service';

xdescribe(`MeetingCollectionMapperService`, () => {
    let service: MeetingCollectionMapperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingCollectionMapperService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
