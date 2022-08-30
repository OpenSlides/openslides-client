import { TestBed } from '@angular/core/testing';

import { PollPercentBasePipe } from './poll-percent-base.pipe';

xdescribe(`PollPercentBasePipe`, () => {
    let pipe: PollPercentBasePipe;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = TestBed.inject(PollPercentBasePipe);
    });

    it(`create an instance`, () => {
        expect(pipe).toBeTruthy();
    });
});
