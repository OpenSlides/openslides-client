import { ToArrayPipe } from './to-array.pipe';

describe(`ToArrayPipe`, () => {
    it(`test values`, () => {
        const pipe = new ToArrayPipe();
        expect(pipe.transform(`a`)).toEqual([`a`]);
        expect(pipe.transform(1)).toEqual([1]);
        expect(pipe.transform(true)).toEqual([true]);
    });

    it(`test with null and undefined`, () => {
        const pipe = new ToArrayPipe();
        expect(pipe.transform(null)).toEqual([]);
        expect(pipe.transform(undefined)).toEqual([]);
    });

    it(`test with array`, () => {
        const pipe = new ToArrayPipe();
        expect(pipe.transform<number>([1, 2])).toEqual([1, 2]);
        expect(pipe.transform<string>([`1`, `2`])).toEqual([`1`, `2`]);
        expect(pipe.transform<boolean>([true, false])).toEqual([true, false]);
    });
});
