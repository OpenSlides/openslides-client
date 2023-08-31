import { Identifiable } from 'src/app/domain/interfaces';

import {
    compareNumber,
    djb2hash,
    escapeRegExp,
    filterObject,
    findIndexInSortedArray,
    getLongPreview,
    getShortPreview,
    isEasterEggTime,
    isEmpty,
    isValidId,
    joinTypedArrays,
    ListUpdateData,
    mmToPoints,
    objectToFormattedString,
    partitionModelsForUpdate,
    reconvertChars,
    replaceObjectKeys,
    splitStringKeepSeperator,
    splitTypedArray,
    stripHtmlTags,
    toBase64,
    toBoolean,
    toDecimal
} from './functions';
import { copy } from './transform-functions';

describe(`utils: functions`, () => {
    describe(`toBase64 function`, () => {
        it(`test with a blob`, async () => {
            const blob = new Blob([`A blobbery blobby blob blob.`]);
            await expectAsync(toBase64(blob)).toBeResolvedTo(`QSBibG9iYmVyeSBibG9iYnkgYmxvYiBibG9iLg==`);
        });

        it(`test with a file`, async () => {
            const file = new File([`A filery fily file file.`], `Peter`);
            await expectAsync(toBase64(file)).toBeResolvedTo(`QSBmaWxlcnkgZmlseSBmaWxlIGZpbGUu`);
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
                `Hello World! This is a paragraph.`
            );
        });
        it(`test with single tag`, () => {
            expect(stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input> `)).toBe(
                `Hello World! Please enter your data:`
            );
            expect(
                stripHtmlTags(`<div>Hello World!</div><span>Please enter your data:</span><input class="data" /> `)
            ).toBe(`Hello World! Please enter your data:`);
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

    describe(`toDecimal function`, () => {
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

    describe(`getLongPreview function`, () => {
        const loremIpsum =
            `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labor`
                .split(` `)
                .join(``);

        it(`test with empty string`, () => {
            expect(getLongPreview(``)).toBe(``);
            expect(getLongPreview(``, 100)).toBe(``);
        });

        it(`test with shorter string`, () => {
            expect(getLongPreview(loremIpsum.slice(0, 150))).toBe(loremIpsum.slice(0, 150));
            expect(getLongPreview(loremIpsum.slice(0, 150)).length).toBe(150);
            expect(getLongPreview(loremIpsum.slice(0, 150), 100)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelit [...] liquyamerat,seddiamvoluptua.Atveroeosetaccusam`
            );
            expect(getLongPreview(loremIpsum.slice(0, 150), 100).length).toBe(100);
        });

        it(`test with longer string`, () => {
            expect(getLongPreview(loremIpsum)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroeosetaccu [...] dgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlabor`
            );
            expect(getLongPreview(loremIpsum).length).toBe(300);
            expect(getLongPreview(loremIpsum, 100)).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelit [...] elitr,seddiamnonumyeirmodtemporinviduntutlabor`
            );
            expect(getLongPreview(loremIpsum, 100).length).toBe(100);
        });

        it(`test with string lengths around 300`, () => {
            expect(getLongPreview(loremIpsum.slice(0, 301))).toBe(
                `Loremipsumdolorsitamet,consetetursadipscingelitr,seddiamnonumyeirmodtemporinviduntutlaboreetdoloremagnaaliquyamerat,seddiamvoluptua.Atveroeosetaccu [...] toduodoloresetearebum.Stetclitakasdgubergren,noseatakimatasanctusestLoremipsumdolorsitamet.Loremipsumdolorsitamet,consetetursadipscingelitr,seddia`
            );
            expect(getLongPreview(loremIpsum.slice(0, 301)).length).toBe(300);
            expect(getLongPreview(loremIpsum.slice(0, 300))).toBe(loremIpsum.slice(0, 300));
            expect(getLongPreview(loremIpsum.slice(0, 300)).length).toBe(300);
            expect(getLongPreview(loremIpsum.slice(0, 299))).toBe(loremIpsum.slice(0, 299));
            expect(getLongPreview(loremIpsum.slice(0, 299)).length).toBe(299);
        });

        it(`test with empty spaces`, () => {
            expect(getLongPreview(`0 1 2 3 4 5 6 7 8 9`, 16)).toBe(`0 1 2 [...] 8 9`);
            expect(getLongPreview(`0 1 2 3 4 5 6 7 8 9`, 16).length).toBe(15);
        });

        it(`test with uneven size`, () => {
            expect(getLongPreview(`abcdefghijklmnopqrstuvwxyz`, 15)).toBe(`abcd [...] wxyz`);
            expect(getLongPreview(`abcdefghijklmnopqrstuvwxyz`, 15).length).toBe(15);
        });

        it(`test with html tags`, () => {
            expect(getLongPreview(`<p>abcdefghijklmnopqrstuvwxyz</p>`, 16)).toBe(`abcde [...] wxyz`);
            expect(getLongPreview(`<p>abcdefghijklmnopqrstuvwxyz</p>`, 16).length).toBe(16);
        });
    });

    describe(`getShortPreview function`, () => {
        const loremIpsum =
            `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labor`
                .split(` `)
                .join(``);

        it(`test with empty string`, () => {
            expect(getShortPreview(``)).toBe(``);
        });

        it(`test with shorter string`, () => {
            expect(getShortPreview(loremIpsum.slice(0, 20))).toBe(`Loremipsumdolorsitam`);
            expect(getShortPreview(loremIpsum.slice(0, 20)).length).toBe(20);
        });

        it(`test with longer string`, () => {
            expect(getShortPreview(loremIpsum)).toBe(`Loremipsumdolorsitamet,consetetursadipscingelit...`);
            expect(getShortPreview(loremIpsum).length).toBe(50);
        });

        it(`test with string lengths around 50`, () => {
            expect(getShortPreview(loremIpsum.slice(0, 51))).toBe(`Loremipsumdolorsitamet,consetetursadipscingelit...`);
            expect(getShortPreview(loremIpsum.slice(0, 51)).length).toBe(50);
            expect(getShortPreview(loremIpsum.slice(0, 50))).toBe(loremIpsum.slice(0, 50));
            expect(getShortPreview(loremIpsum.slice(0, 50)).length).toBe(50);
            expect(getShortPreview(loremIpsum.slice(0, 49))).toBe(loremIpsum.slice(0, 49));
            expect(getShortPreview(loremIpsum.slice(0, 49)).length).toBe(49);
        });

        it(`test with empty spaces`, () => {
            expect(getShortPreview(`Letters: a b c d e f g h i j k l m n o p q r s t u v w x y z`)).toBe(
                `Letters: a b c d e f g h i j k l m n o p q r s...`
            );
            expect(getShortPreview(`Letters: a b c d e f g h i j k l m n o p q r s t u v w x y z`).length).toBe(49);
        });

        it(`test with html tags`, () => {
            expect(getShortPreview(`<p>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz</p>`)).toBe(
                `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstu...`
            );
            expect(getShortPreview(`<p>abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz</p>`).length).toBe(50);
        });
    });

    describe(`isEasterEggTime function`, () => {
        const data: {
            test: Date;
            expect: boolean;
        }[] = [
            { test: new Date(2000, 1, 1), expect: false },
            { test: new Date(2011, 5, 12, 13, 45, 34), expect: false },
            { test: new Date(1782, 3, 5), expect: false },
            { test: new Date(1969, 6, 27), expect: false },
            { test: new Date(2066, 3, 1), expect: true },
            { test: new Date(1567, 3, 1), expect: true }
        ];

        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        for (const date of data) {
            it(`test with ${date.test.toLocaleString()}`, () => {
                jasmine.clock().mockDate(date.test);
                expect(isEasterEggTime()).toBe(date.expect);
            });
        }
    });

    describe(`mmToPoints function`, () => {
        const data: {
            test: [number, number] | [number];
            expect: number;
        }[] = [
            { test: [0], expect: 0 },
            { test: [0, 0], expect: 0 },
            { test: [1, 0], expect: 0 },
            { test: [0, 1], expect: 0 },
            { test: [42], expect: 119.05511811023624 },
            { test: [42, 99], expect: 163.70078740157481 },
            { test: [123, 45], expect: 217.91338582677167 },
            { test: [123], expect: 348.66141732283467 },
            { test: [-1], expect: -2.8346456692913384 },
            { test: [Number.POSITIVE_INFINITY], expect: Number.POSITIVE_INFINITY },
            { test: [1, Number.POSITIVE_INFINITY], expect: Number.POSITIVE_INFINITY }
        ];

        for (const date of data) {
            it(`test with ${date.test[0]} mm and ${date.test.length === 2 ? date.test[1] : `no`} density`, () => {
                expect(mmToPoints(date.test[0], date.test[1])).toBe(date.expect);
            });
        }
    });

    describe(`compareNumber function`, () => {
        const data: {
            test: [number, number];
            expect?: `positive` | `negative`;
        }[] = [
            { test: [undefined, undefined] },
            { test: [0, undefined], expect: `negative` },
            { test: [undefined, 0], expect: `positive` },
            { test: [0, 0] },
            { test: [1, 0], expect: `negative` },
            { test: [0, 1], expect: `positive` },
            { test: [99, 42], expect: `negative` },
            { test: [42, 99], expect: `positive` },
            { test: [42, 42] },
            { test: [42, undefined], expect: `negative` },
            { test: [undefined, 42], expect: `positive` },
            { test: [-1, 1], expect: `positive` },
            { test: [1, -1], expect: `negative` },
            { test: [Number.POSITIVE_INFINITY, 1], expect: `negative` },
            { test: [1, Number.POSITIVE_INFINITY], expect: `positive` }
        ];

        for (const date of data) {
            switch (date.expect) {
                case `positive`:
                    it(`test ${date.test[0]} and ${date.test[1]} for positive comparison`, () => {
                        expect(compareNumber(date.test[0], date.test[1])).toBeGreaterThan(0);
                    });
                    break;
                case `negative`:
                    it(`test ${date.test[0]} and ${date.test[1]} for negative comparison`, () => {
                        expect(compareNumber(date.test[0], date.test[1])).toBeLessThan(0);
                    });
                    break;
                default:
                    it(`test ${date.test[0]} and ${date.test[1]} for equal comparison`, () => {
                        expect(compareNumber(date.test[0], date.test[1])).toBe(0);
                    });
            }
        }
    });

    describe(`isEmpty function`, () => {
        const data: {
            test: any;
            expect: boolean;
        }[] = [
            { test: null, expect: true },
            { test: undefined, expect: true },
            { test: [], expect: true },
            { test: {}, expect: true },
            { test: 0, expect: false },
            { test: 1, expect: false },
            { test: ``, expect: false },
            { test: `a`, expect: false },
            { test: [42], expect: false },
            { test: { answer: 42 }, expect: false }
        ];

        for (const date of data) {
            it(`test with ${date.test}`, () => {
                expect(isEmpty(date.test)).toBe(date.expect);
            });
        }
    });

    describe(`escapeRegExp function`, () => {
        const data: {
            test: string;
            expect: string;
            name?: string;
        }[] = [
            { test: `<`, expect: `<` },
            { test: `>`, expect: `>` },
            { test: ` `, expect: ` `, name: `space` },
            { test: `.`, expect: `\\.` },
            { test: `!`, expect: `!` },
            { test: `-`, expect: `-` },
            { test: `\n`, expect: `\n`, name: `break-line` }
        ];

        for (const date of data) {
            it(`test with ${date.name ?? date.test}`, () => {
                expect(escapeRegExp(date.test)).toBe(date.expect);
            });
        }
    });

    describe(`splitStringKeepSeparator function`, () => {
        const data: {
            test: string[];
            expect: string[];
        }[] = [
            {
                test: [`>_> >.< <html tag>`, `>`, `prepend`],
                expect: [`>_`, `> `, `>.< <html tag`, `>`]
            },
            {
                test: [`. these. are a .lot of .dots .`, `.`, `append`],
                expect: [`.`, ` these.`, ` are a .`, `lot of .`, `dots .`]
            },
            {
                test: [`I don't like mondays`, `don't`, `between`],
                expect: [`I `, `don't`, ` like mondays`]
            },
            {
                test: [`Some other string`, ` `, `Some other string`],
                expect: [`Some`, ` `, `other`, ` `, `string`]
            },
            {
                test: [`1 - 2 - 3 - 5 = -9`, `-`],
                expect: [`1 `, `-`, ` 2 `, `-`, ` 3 `, `-`, ` 5 = `, `-`, `9`]
            }
        ];

        for (const date of data) {
            it(`test with "${date.test[0]}"`, () => {
                const test = date.test;
                test.push(undefined);
                expect(splitStringKeepSeperator(test[0], test[1], test[2])).toEqual(date.expect);
            });
        }
    });

    describe(`djb2hash function`, () => {
        const data: {
            test: string;
            expect: string;
        }[] = [
            { test: ``, expect: `5381` },
            { test: ` `, expect: `177605` },
            { test: `Hello World`, expect: `-2022174591` },
            { test: `Apples`, expect: `-1482141334` },
            { test: `Lorem ipsum dolor sit amet`, expect: `-157398551` },
            { test: `!"§$%&/()=`, expect: `2127362171` },
            { test: `1234567890`, expect: `-276485134` },
            { test: `ABCDEFGHIJKLMNOP`, expect: `-2596616051` },
            { test: `abcdefg`, expect: `442645281` }
        ];

        for (const date of data) {
            it(`test with "${date.test}"`, () => {
                expect(djb2hash(date.test)).toBe(date.expect);
            });
        }
    });

    describe(`joinTypedArrays function`, () => {
        it(`join two UInt8Arrays`, () => {
            const a = Uint8Array.from([1, 2, 3, 4]);
            const b = Uint8Array.from([5, 6, 7, 8]);

            const joined = joinTypedArrays(Uint8Array, a, b);
            const expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);

            expect(joined).toEqual(expected);
        });
    });

    describe(`splitTypedArray function`, () => {
        it(`split array no seperator at end`, () => {
            const a = Uint8Array.from([1, 2, 10, 3, 4]);

            const joined = splitTypedArray(10, a);
            const expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at end`, () => {
            const a = Uint8Array.from([1, 2, 10, 3, 4, 10]);

            const joined = splitTypedArray(10, a);
            const expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4, 10])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperator at start`, () => {
            const a = Uint8Array.from([10, 1, 2, 10, 3, 4]);

            const joined = splitTypedArray(10, a);
            const expected = [Uint8Array.from([10]), Uint8Array.from([1, 2, 10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });

        it(`split array seperators following directly`, () => {
            const a = Uint8Array.from([1, 2, 10, 10, 3, 4]);

            const joined = splitTypedArray(10, a);
            const expected = [Uint8Array.from([1, 2, 10]), Uint8Array.from([10]), Uint8Array.from([3, 4])];

            expect(joined).toEqual(expected);
        });
    });

    describe(`objectToFormattedString function`, () => {
        const testObject = {
            array: [`string1`, `string2`],
            object: {
                number: 1,
                boolean: true
            },
            string: `string`
        };
        const expected = `{\n   "array": [\n      "string1",\n      "string2"\n   ],\n   "object": {\n      "number": 1,\n      "boolean": true\n   },\n   "string": "string"\n}`;
        it(`test with an object`, () => {
            expect(objectToFormattedString(testObject)).toBe(expected);
        });

        it(`test with a json string`, () => {
            expect(objectToFormattedString(JSON.stringify(testObject))).toBe(expected);
        });

        it(`test with empty values`, () => {
            expect(objectToFormattedString(undefined)).toBe(undefined);
            expect(objectToFormattedString(null)).toBe(undefined);
            expect(objectToFormattedString(``)).toBe(undefined);
        });
    });

    describe(`isValidId function`, () => {
        it(`test with valid ids`, () => {
            expect(isValidId(1)).toBe(true);
            expect(isValidId(10)).toBe(true);
            expect(isValidId(42)).toBe(true);
            expect(isValidId(9)).toBe(true);
            expect(isValidId(1234567890)).toBe(true);
        });

        it(`test with invalid values`, () => {
            expect(isValidId(0)).toBe(false);
            expect(isValidId(-1)).toBe(false);
            expect(isValidId(-42)).toBe(false);
            expect(isValidId(1.7)).toBe(false);
            expect(isValidId(Number.NaN)).toBe(false);
            expect(isValidId(Number.NEGATIVE_INFINITY)).toBe(false);
            expect(isValidId(Number.POSITIVE_INFINITY)).toBe(false);
        });
    });

    describe(`filterObject function`, () => {
        it(`test with an object`, () => {
            const obj = { a: 0, b: 2, c: undefined, d: null, e: `z`, f: `` };
            expect(filterObject(copy(obj), keyVal => !!keyVal.value)).toEqual({
                b: 2,
                e: `z`
            });

            expect(filterObject(obj, keyVal => typeof keyVal.value === `number`)).toEqual({
                a: 0,
                b: 2
            });

            expect(obj).toEqual({ a: 0, b: 2, c: undefined, d: null, e: `z`, f: `` });
        });

        it(`test with null`, () => {
            expect(filterObject(null, keyVal => !!keyVal.value)).toEqual(null);
        });
    });

    describe(`partitionModelsForUpdate function`, () => {
        type TestModel = Identifiable & { [key: string]: any };
        type PartitionModelsForUpdateTestPayload<T extends Identifiable> = {
            test: { newValues: (T | Omit<T, `id`>)[]; originals: T[] };
            expect: ListUpdateData<T>;
        };
        const data: ({ title: string } & PartitionModelsForUpdateTestPayload<TestModel>)[] = [
            {
                title: `models that should create`,
                test: { newValues: [{ a: 1, b: 2 }], originals: [] },
                expect: { toCreate: [{ a: 1, b: 2 }] }
            },
            {
                title: `models that should update`,
                test: {
                    newValues: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 2 }
                    ],
                    originals: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 4 }
                    ]
                },
                expect: { toUpdate: [{ id: 2, a: 3, b: 2 }] }
            },
            {
                title: `models that have ids, but are not present in originals`,
                test: {
                    newValues: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 2 },
                        { id: 3, a: 3, b: 2 }
                    ],
                    originals: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 4 }
                    ]
                },
                expect: {
                    toUpdate: [
                        { id: 2, a: 3, b: 2 },
                        { id: 3, a: 3, b: 2 }
                    ]
                }
            },
            {
                title: `models that should delete`,
                test: {
                    newValues: [{ id: 1, a: 2, b: 3 }],
                    originals: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 4 },
                        { id: 5, a: 1, b: 1 }
                    ]
                },
                expect: { toDelete: [2, 5] }
            },
            {
                title: `models that should do all three`,
                test: {
                    newValues: [
                        { id: 1, a: 2, b: 3 },
                        { id: 4, a: 5, b: 6 },
                        { a: 7, b: 8 },
                        { a: 6, b: 7 }
                    ],
                    originals: [
                        { id: 1, a: 2, b: 3 },
                        { id: 2, a: 3, b: 4 },
                        { id: 4, a: 1, b: 1 },
                        { id: 5, a: 6, b: 7 }
                    ]
                },
                expect: {
                    toCreate: [
                        { a: 7, b: 8 },
                        { a: 6, b: 7 }
                    ],
                    toUpdate: [{ id: 4, a: 5, b: 6 }],
                    toDelete: [2, 5]
                }
            }
        ];

        for (const date of data) {
            it(`test with ${date.title}`, () => {
                expect(partitionModelsForUpdate<TestModel>(date.test.newValues, date.test.originals)).toEqual(
                    date.expect
                );
            });
        }
    });

    describe(`replaceObjectKeys function`, () => {
        const original = { I: `am`, with: `object`, an: 4, ugly: `keys` };
        const expected = { I: `am`, an: `object`, with: 4, beautiful: `keys` };

        it(`test without reverse`, () => {
            expect(
                replaceObjectKeys(original, [
                    [`with`, `an`],
                    [`an`, `with`],
                    [`ugly`, `beautiful`],
                    [`useless`, `replacement config`]
                ])
            ).toEqual(expected);

            expect(
                replaceObjectKeys(
                    original,
                    [
                        [`with`, `an`],
                        [`an`, `with`],
                        [`ugly`, `beautiful`],
                        [`useless`, `replacement config`]
                    ],
                    false
                )
            ).toEqual(expected);
        });

        it(`test with reverse`, () => {
            expect(
                replaceObjectKeys(
                    original,
                    [
                        [`with`, `an`],
                        [`an`, `with`],
                        [`beautiful`, `ugly`],
                        [`useless`, `replacement config`]
                    ],
                    true
                )
            ).toEqual(expected);
        });

        it(`test with keys with spaces`, () => {
            expect(
                replaceObjectKeys({ a: `b`, 'c d': `e`, f: `g h` }, [
                    [`a`, `b`],
                    [`c d`, `e`],
                    [`f`, `g h`]
                ])
            ).toEqual({ b: `b`, e: `e`, 'g h': `g h` });
        });
    });

    describe(`findIndexInSortedArray function`, () => {
        const sortedArray = [1, 4, 5, 7, 8, 9];

        for (let searchValue = 0; searchValue < 10; searchValue++) {
            const expected = sortedArray.findIndex(val => searchValue === val);
            it(`test result for ${searchValue} in ${JSON.stringify(sortedArray)}`, () => {
                expect(findIndexInSortedArray(sortedArray, searchValue, (a, b) => a - b)).toBe(expected);
            });
        }

        const sortedStringArray = [`a`, `b`, `d`];

        for (const searchValue of [`b`, `c`, `d`, `e`]) {
            const expected = sortedStringArray.findIndex(val => searchValue === val);
            it(`test result for "${searchValue}" in ${JSON.stringify(sortedStringArray)}`, () => {
                expect(findIndexInSortedArray(sortedStringArray, searchValue, (a, b) => a.localeCompare(b))).toBe(
                    expected
                );
            });
        }

        it(`finds first among many`, () => {
            expect(findIndexInSortedArray([1, 1, 1, 1, 1, 1, 1], 1, (a, b) => a - b)).toBe(0);
        });
    });
});
