import { ReversePipe } from './reverse.pipe';

describe(`ReversePipe`, () => {
    let pipe: ReversePipe;

    beforeEach(async () => {
        pipe = new ReversePipe();
    });

    it(`check if array is in reverse`, () => {
        const array = pipe.transform([1, 2, 3, 4, 5]);

        expect(array).toEqual([5, 4, 3, 2, 1]);
    });

    it(`check if original array was manipulated`, () => {
        const origArr = [1, 2, 3, 4, 5];
        pipe.transform(origArr);

        expect(origArr).toEqual([1, 2, 3, 4, 5]);
    });
});
