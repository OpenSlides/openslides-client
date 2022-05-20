import { TestBed } from '@angular/core/testing';

import { MeetingMediaAdapterService } from './meeting-media-adapter.service';

describe(`MeetingMediaAdapterService`, () => {
    let service: MeetingMediaAdapterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingMediaAdapterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
