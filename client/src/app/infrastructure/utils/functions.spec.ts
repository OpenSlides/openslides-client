import {
    joinTypedArrays,
    reconvertChars,
    splitTypedArray,
    stripHtmlTags,
    toBase64,
    toBoolean,
    toDecimal
} from './functions';

describe(`utils: functions`, () => {
    describe(`toBase64 function`, () => {
        it(`test with a blob`, async () => {
            const blob = new Blob([`A blobbery blobby blob blob.`]);
            expect(await toBase64(blob)).toBe(`QSBibG9iYmVyeSBibG9iYnkgYmxvYiBibG9iLg==`);
        });

        it(`test with a file`, async () => {
            const file = new File([`A filery fily file file.`], `Peter`);
            expect(await toBase64(file)).toBe(`QSBmaWxlcnkgZmlseSBmaWxlIGZpbGUu`);
        });
    });

    describe(`reconvertChars function`, () => {
        it(`test every reconverted value`, () => {
            expect(
                reconvertChars(
                    `&auml;&#228;&Auml;&#196;&ouml;&#246;&Ouml;&#214;&uuml;&Uuml;&aring;&#229;&Aring;&#197;&szlig;&#223;`
                )
            ).toBe(`ääÄÄööÖÖüÜååÅÅßß`);
        });
    });

    describe(`stripHtmlTags function`, () => {
        it(`test with simple tags`, () => {
            expect(stripHtmlTags(`<div>Hello World!</div> `)).toBe(`Hello World!`);
            expect(stripHtmlTags(`<div>Hello World!<p>This is a paragraph.</p></div>`)).toBe(
                `Hello World!This is a paragraph.`
            );
        });
        it(`test with single tag`, () => {
            expect(stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input> `)).toBe(
                `Hello World!Please enter your data:`
            );
            expect(
                stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input class="data" /> `)
            ).toBe(`Hello World!Please enter your data:`);
        });
    });

    describe(`toBoolean function`, () => {
        it(`test with various values`, () => {
            expect(toBoolean(`1`)).toBe(true);
            expect(toBoolean(`on`)).toBe(true);
            expect(toBoolean(`true`)).toBe(true);
            expect(toBoolean(`0`)).toBe(false);
            expect(toBoolean(`off`)).toBe(false);
            expect(toBoolean(`false`)).toBe(false);
            expect(toBoolean(``)).toBe(false);
            expect(toBoolean(`A hat`)).toBe(false);
            expect(toBoolean(`A stick`)).toBe(false);
            expect(toBoolean(`An umbrella`)).toBe(false);
        });
    });

    fdescribe(`toDecimal function`, () => {
        it(`test with various acceptable values`, () => {
            expect(toDecimal(`1`)).toBe(`1.000000`);
            expect(toDecimal(`1.234`)).toBe(`1.234000`);
            expect(toDecimal(`1.23456789`)).toBe(`1.234568`);
            expect(toDecimal(1)).toBe(`1.000000`);
            expect(toDecimal(1.234)).toBe(`1.234000`);
            expect(toDecimal(1.23456789)).toBe(`1.234568`);
            expect(toDecimal(undefined)).toBe(null);
        });

        it(`test with various unacceptable values`, () => {
            expect(() => toDecimal(`1,234`)).toThrowError(`Can't convert "1,234" to number`);
            expect(() => toDecimal(`fourtytwo`)).toThrowError(`Can't convert "fourtytwo" to number`);
        });
    });

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
