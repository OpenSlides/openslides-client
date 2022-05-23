import { TestBed } from '@angular/core/testing';

import { GetForwardingMeetingsPresenterService } from './get-forwarding-meetings-presenter.service';

describe(`GetForwardingMeetingsPresenterService`, () => {
    let service: GetForwardingMeetingsPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GetForwardingMeetingsPresenterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
