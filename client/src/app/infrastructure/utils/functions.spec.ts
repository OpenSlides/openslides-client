import { joinTypedArrays, splitTypedArray } from './functions';

describe(`utils: functions`, () => {
    describe(`joinTypedArrays function`, () => {
        it(`join two UInt8Arrays`, () => {
            let a = Uint8Array.from([1, 2, 3, 4]);
            let b = Uint8Array.from([5, 6, 7, 8]);

            let joined = joinTypedArrays(Uint8Array, a, b);
            let expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);

            expect(joined).toEqual(expected);
        });
    });

    describe(`splitTypedArray function`, () => {
        it(`split array no seperator at end`, () => {
            let a = Uint8Array.from([1, 2, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at end`, () => {
            let a = Uint8Array.from([1, 2, 10, 3, 4, 10]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4, 10])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at start`, () => {
            let a = Uint8Array.from([10, 1, 2, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([10]), Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperators following directly`, () => {
            let a = Uint8Array.from([1, 2, 10, 10, 3, 4]);

            let joined = splitTypedArray(10, a);
            let expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });
    });
});
