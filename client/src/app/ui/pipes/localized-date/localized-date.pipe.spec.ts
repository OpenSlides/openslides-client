import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocalizedDatePipe } from './localized-date.pipe';

describe(`LocalizedDatePipe`, () => {
    let pipe: LocalizedDatePipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [LocalizedDatePipe, ChangeDetectorRef]
        }).compileComponents();

        pipe = TestBed.inject(LocalizedDatePipe);
    });

    it(`test with timestamp 0`, () => {
        expect(pipe.transform(0)).toBe(`Jan 1, 1970, 12:00 AM`);
        expect(pipe.transform(0, `PP`)).toBe(`Jan 1, 1970`);
    });

    it(`test with timestamp past 1970`, () => {
        expect(pipe.transform(42424242)).toBe(`May 7, 1971, 12:30 AM`);
        expect(pipe.transform(42424242, `PP`)).toBe(`May 7, 1971`);
    });

    it(`test with invalid parameters`, () => {
        expect(pipe.transform(Number.NaN)).toBe(``);
        expect(pipe.transform(undefined)).toBe(``);
        expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe(``);
        expect(pipe.transform(Number.NEGATIVE_INFINITY)).toBe(``);
    });
});
