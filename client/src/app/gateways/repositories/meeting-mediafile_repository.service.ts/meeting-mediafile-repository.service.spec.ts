import { TestBed } from '@angular/core/testing';

import { MeetingMediafileRepositoryService } from './meeting-mediafile-repository.service';

xdescribe(`MediafileRepositoryService`, () => {
    let service: MeetingMediafileRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingMediafileRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
