import { TestBed } from '@angular/core/testing';

import { MeetingDataStoreService } from './meeting-data-store.service';

xdescribe(`MeetingDataStoreService`, () => {
    let service: MeetingDataStoreService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingDataStoreService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
