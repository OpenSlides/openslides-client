import { addCSSClassToFirstTag, replaceHtmlEntities } from './dom-helpers';

describe(`utils: dom helpers`, () => {
    describe(`replaceHtmlEntities function`, () => {
        it(`check some entities`, () => {
            const res = replaceHtmlEntities(`&uuml;&#177;`);

            expect(res).toBe(`ü±`);
        });

        it(`check lt and gt entities`, () => {
            const res = replaceHtmlEntities(`<&lt;Test&gt;>`);

            expect(res).toBe(`<&lt;Test&gt;>`);
        });
    });

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
