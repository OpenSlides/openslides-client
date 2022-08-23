import { addCSSClassToFirstTag } from "./dom-helpers";

describe(`utils: dom helpers`, () => {
    describe(`addCSSClassToFirstTag function`, () => {
        it(`works with plain tags`, () => {
            const strIn = `<ol start='2'><li>`,
                inserted = addCSSClassToFirstTag(strIn, `newClass`);
            expect(inserted).toBe(`<ol start='2' class="newClass"><li>`);
        });

        it(`works with tags already having classes`, () => {
            const strIn = `<ol start='2' class='my-old-class'><li>`,
                inserted = addCSSClassToFirstTag(strIn, `newClass`);
            expect(inserted).toBe(`<ol start='2' class="my-old-class newClass"><li>`);
        });
    });
});

