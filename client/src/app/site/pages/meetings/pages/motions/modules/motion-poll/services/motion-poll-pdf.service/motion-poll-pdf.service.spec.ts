import { TestBed } from '@angular/core/testing';

import { MotionPollPdfService } from './motion-poll-pdf.service';

describe(`MotionPollPdfService`, () => {
    let service: MotionPollPdfService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionPollPdfService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
