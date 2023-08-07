import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from 'src/app/site/pages/meetings/modules/poll/pipes/poll-parse-number/poll-parse-number.pipe.spec';

import { TimePipe } from './time.pipe';

describe(`TimePipe`, () => {
    let pipe: TimePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [TimePipe, { provide: TranslateService, useClass: MockTranslateService }]
        }).compileComponents();

        TestBed.inject(TranslateService);
        pipe = TestBed.inject(TimePipe);
    });

    it(`test with timestamp 0`, () => {
        expect(pipe.transform(0)).toBe(`1/1/1970, 12:00:00 AM`);
    });

    it(`test with timestamp past 1970`, () => {
        expect(pipe.transform(42424242)).toBe(`5/7/1971, 12:30:42 AM`);
    });

    it(`test with invalid parameters`, () => {
        expect(pipe.transform(Number.NaN)).toBe(`Invalid Date`);
        expect(pipe.transform(undefined)).toBe(`Invalid Date`);
        expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe(`Invalid Date`);
        expect(pipe.transform(Number.NEGATIVE_INFINITY)).toBe(`Invalid Date`);
    });
});
