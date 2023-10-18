import { TestBed } from '@angular/core/testing';

import { DurationService } from './duration.service';

describe(`DurationService`, () => {
    let service: DurationService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [DurationService] });
        service = TestBed.inject(DurationService);
    });

    it(`test stringToDuration`, () => {
        expect(service.stringToDuration(`1:23h`, `h`)).toBe(83);
        expect(service.stringToDuration(`1:23m`, `m`)).toBe(83);
        expect(service.stringToDuration(`123m`, `m`)).toBe(123);
        expect(service.stringToDuration(`1:23`, `h`)).toBe(83);
        expect(service.stringToDuration(`1:23`, `m`)).toBe(83);
        expect(service.stringToDuration(`123`, `m`)).toBe(123);
        expect(service.stringToDuration()).toBe(0);
        expect(service.stringToDuration(`1:23 h`, `h`)).toBe(83);
    });

    it(`test durationToStringWithHours`, () => {
        expect(service.durationToStringWithHours(83)).toBe(`0:01:23 h`);
        expect(service.durationToStringWithHours(7345)).toBe(`2:02:25 h`);
        expect(service.durationToStringWithHours(-1)).toBe(`-0:00:01 h`);
        expect(service.durationToStringWithHours(undefined)).toBe(``);
    });

    it(`test durationToString`, () => {
        expect(service.durationToString(83, `h`)).toBe(`1:23 h`);
        expect(service.durationToString(7345, `h`)).toBe(`122:25 h`);
        expect(service.durationToString(-1, `h`)).toBe(`-0:01 h`);
        expect(service.durationToString(undefined, `h`)).toBe(``);
        expect(service.durationToString(83, `m`)).toBe(`1:23 m`);
        expect(service.durationToString(7345, `m`)).toBe(`122:25 m`);
        expect(service.durationToString(-1, `m`)).toBe(`-0:01 m`);
        expect(service.durationToString(undefined, `m`)).toBe(``);
    });
});
