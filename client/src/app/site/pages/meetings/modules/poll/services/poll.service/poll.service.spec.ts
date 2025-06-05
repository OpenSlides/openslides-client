import { TestBed } from '@angular/core/testing';

import { PollService } from './poll.service';

// TODO: Enable test
xdescribe(`PollService`, () => {
    let service: PollService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PollService);
    });

    it(`test with majority`, () => {
        expect(service.parseNumber(-1)).toBe(`majority`);
    });

    it(`test with empty values`, () => {
        expect(service.parseNumber(undefined)).toBe(`0`);
        expect(service.parseNumber(null)).toBe(`0`);
    });

    it(`test with undocumented`, () => {
        expect(service.parseNumber(-2)).toBe(`undocumented`);
    });

    it(`test with normal numbers`, () => {
        expect(service.parseNumber(0)).toBe(`0`);
        expect(service.parseNumber(1)).toBe(`1`);
        expect(service.parseNumber(42)).toBe(`42`);
        expect(service.parseNumber(99)).toBe(`99`);
        expect(service.parseNumber(255)).toBe(`255`);
        expect(service.parseNumber(256)).toBe(`256`);
        expect(service.parseNumber(1024)).toBe(`1024`);
        expect(service.parseNumber(140737488355328)).toBe(`140737488355328`);
    });

    it(`test with special numbers`, () => {
        expect(service.parseNumber(Number.NaN)).toBe(`NaN`);
        expect(service.parseNumber(Number.POSITIVE_INFINITY)).toBe(`∞`);
        expect(service.parseNumber(Number.NEGATIVE_INFINITY)).toBe(`-∞`);
    });
});
