import { TestBed } from '@angular/core/testing';

import { PollParseNumberPipe } from './poll-parse-number.pipe';

xdescribe(`PollParseNumberPipe`, () => {
    let pipe: PollParseNumberPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = TestBed.inject(PollParseNumberPipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
