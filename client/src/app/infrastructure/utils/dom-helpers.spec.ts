import { replaceHtmlEntities, unwrapNode } from './dom-helpers';

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

    describe(`unwrapNode function`, () => {
        it(`unwrapNode removes sourrounding node`, () => {
            const el = document.createElement(`body`);
            el.innerHTML = `<div class="outer"><div class="inner"></div></div>`;
            unwrapNode(el.querySelector(`.outer`));
            expect(el.outerHTML).toBe(`<body><div class="inner"></div></body>`);
        });

        it(`unwrapNode preserves multiple inner nodes`, () => {
            const el = document.createElement(`body`);
            el.innerHTML = `<div class="outer"><div class="inner"></div><div class="inner-2"></div></div>`;
            unwrapNode(el.querySelector(`.outer`));
            expect(el.outerHTML).toBe(`<body><div class="inner"></div><div class="inner-2"></div></body>`);
        });

        it(`unwrapNode removes empty node`, () => {
            const el = document.createElement(`body`);
            el.innerHTML = `<div class="outer"></div>`;
            unwrapNode(el.querySelector(`.outer`));
            expect(el.outerHTML).toBe(`<body></body>`);
        });
    });
});
