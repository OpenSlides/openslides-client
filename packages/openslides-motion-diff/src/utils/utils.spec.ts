import { describe, expect, it } from "vitest";
import { splitStringKeepSeperator } from "./utils";

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
            expect(splitStringKeepSeperator(test[0], test[1], test[2])).toEqual(date.expect);
        });
    }
});
