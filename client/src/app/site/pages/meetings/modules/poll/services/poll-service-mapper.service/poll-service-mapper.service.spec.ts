import { TestBed } from '@angular/core/testing';

import { PollServiceMapperService } from './poll-service-mapper.service';

xdescribe(`PollServiceMapperService`, () => {
    let service: PollServiceMapperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollServiceMapperService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
