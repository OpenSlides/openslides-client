import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { PollParseNumberPipe } from './poll-parse-number.pipe';

class MockTranslateService {
    public instant(text: string): string {
        return text;
    }
}

describe(`PollParseNumberPipe`, () => {
    let pipe: PollParseNumberPipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [PollParseNumberPipe, { provide: TranslateService, useClass: MockTranslateService }]
        }).compileComponents();

        TestBed.inject(TranslateService);
        pipe = TestBed.inject(PollParseNumberPipe);
    });

    it(`test with majority`, () => {
        expect(pipe.transform(-1)).toBe(`majority`);
    });

    it(`test with empty values`, () => {
        expect(pipe.transform(undefined)).toBe(`0`);
        expect(pipe.transform(null)).toBe(`0`);
    });

    it(`test with undocumented`, () => {
        expect(pipe.transform(-2)).toBe(`undocumented`);
    });

    it(`test with normal numbers`, () => {
        expect(pipe.transform(0)).toBe(`0`);
        expect(pipe.transform(1)).toBe(`1`);
        expect(pipe.transform(42)).toBe(`42`);
        expect(pipe.transform(99)).toBe(`99`);
        expect(pipe.transform(255)).toBe(`255`);
        expect(pipe.transform(256)).toBe(`256`);
        expect(pipe.transform(1024)).toBe(`1024`);
        expect(pipe.transform(140737488355328)).toBe(`140737488355328`);
    });

    it(`test with special numbers`, () => {
        expect(pipe.transform(Number.NaN)).toBe(`NaN`);
        expect(pipe.transform(Number.POSITIVE_INFINITY)).toBe(`∞`);
        expect(pipe.transform(Number.NEGATIVE_INFINITY)).toBe(`-∞`);
    });
});
