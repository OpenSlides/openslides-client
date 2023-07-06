import {
    addClassToHtmlTag,
    addClassToLastNode,
    addCSSClass,
    addCSSClassToFirstTag,
    fragmentToHtml,
    getNodeByName,
    getNodeContextTrace,
    getNthOfListItem,
    htmlToFragment,
    htmlToUppercase,
    isFirstNonemptyChild,
    isInlineElement,
    isValidInlineHtml,
    nodesToHtml,
    removeCSSClass,
    replaceHtmlEntities,
    serializeTag,
    sortHtmlAttributes
} from './dom-helpers';

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

    describe(`getNodeByName function`, () => {
        const dummyEl3Span = document.createElement(`div`);
        dummyEl3Span.innerHTML = `<span>test-span1</span><span>test-span1</span><span>test-span2</span><span>test-span3</span>`;

        it(`get first span match`, () => {
            const res = getNodeByName(dummyEl3Span, `span`);
            expect(res.innerHTML).toBe(`test-span1`);
        });

        it(`get span match case should not matter`, () => {
            const res = getNodeByName(dummyEl3Span, `SpAn`);
            expect(res.innerHTML).toBe(`test-span1`);
        });

        it(`get last span match`, () => {
            const res = getNodeByName(dummyEl3Span, `span`, true);
            expect(res.innerHTML).toBe(`test-span3`);
        });

        it(`search not existing`, () => {
            const res = getNodeByName(dummyEl3Span, `non-existant`, true);
            expect(res).toBe(null);
        });

        it(`search is container`, () => {
            const res = getNodeByName(dummyEl3Span, `div`);
            expect(res).toBe(dummyEl3Span);
        });

        it(`search is container case should not matter`, () => {
            const res = getNodeByName(dummyEl3Span, `DiV`);
            expect(res).toBe(dummyEl3Span);
        });

        it(`search in text node`, () => {
            const res = getNodeByName(document.createTextNode(`Text node`), ``);
            expect(res).toBe(null);
        });
    });

    describe(`getNodeContextTrace function`, () => {
        it(`get a parent node`, () => {
            const parent = document.createElement(`parent`);
            const child = document.createElement(`child`);
            parent.appendChild(child);

            const res = getNodeContextTrace(child);
            expect(res.length).toBe(2);
            expect(res[0]).toBe(parent);
            expect(res[1]).toBe(child);
        });

        it(`pass root node`, () => {
            const parent = document.createElement(`parent`);
            const child = document.createElement(`child`);
            parent.appendChild(child);

            const res = getNodeContextTrace(parent);
            expect(res.length).toBe(1);
            expect(res[0]).toBe(parent);
        });

        it(`empty node`, () => {
            const res = getNodeContextTrace(null);
            expect(res.length).toBe(0);
        });
    });

    describe(`isFirstNonemptyChild function`, () => {
        it(`passed element is first non empty child`, () => {
            const container = document.createElement(`div`);
            container.innerHTML = `<el1></el1><el2></el2><el3></el3>`;
            expect(isFirstNonemptyChild(container, container.firstChild)).toBe(true);
        });

        it(`passed element is not first non empty child`, () => {
            const container = document.createElement(`div`);
            container.innerHTML = `<el1></el1><el2></el2><el3></el3>`;
            expect(isFirstNonemptyChild(container, container.lastChild)).toBe(false);
        });

        it(`passed element is not a child`, () => {
            const container = document.createElement(`div`);
            container.innerHTML = `<el1></el1><el2></el2><el3></el3>`;
            expect(isFirstNonemptyChild(container, document.createElement(`el1`))).toBe(false);
        });

        it(`passed element without children`, () => {
            const container = document.createElement(`div`);
            expect(isFirstNonemptyChild(container, document.createElement(`el1`))).toBe(false);
        });
    });

    describe(`getNthOfListItem function`, () => {
        it(`get correct number of list item`, () => {
            const container = document.createElement(`ul`);
            container.innerHTML = `<li>1</li><li>2</li><li>3</li>`;
            expect(getNthOfListItem(container, container.lastChild)).toBe(3);
        });

        it(`get correct number of child node in list item`, () => {
            const container = document.createElement(`ul`);
            container.innerHTML = `<li>1</li><li>2</li><li><span>3</span></li>`;
            expect(getNthOfListItem(container, container.lastChild.firstChild)).toBe(3);
        });

        it(`get correct number of non existing list item`, () => {
            const container = document.createElement(`ul`);
            container.innerHTML = `<li>1</li><li>2</li><li>3</li>`;
            expect(getNthOfListItem(container, document.createElement(`li`))).toBe(null);
        });
    });

    describe(`htmlToFragment function`, () => {
        it(`htmlToFragment equals fragment`, () => {
            const fragment = new DocumentFragment();
            for (let i = 1; i < 4; i++) {
                const li = document.createElement(`li`);
                li.textContent = `${i}`;
                fragment.append(li);
            }

            expect(htmlToFragment(`<li>1</li><li>2</li><li>3</li>`)).toEqual(fragment);
        });
    });

    describe(`fragmentToHtml function`, () => {
        it(`fragmentToHtml equals output of htmlToFragment`, () => {
            const html = `<li>1</li><li>2</li><li>3</li>`;
            const fragment = htmlToFragment(`<li>1</li><li>2</li><li>3</li>`);

            expect(fragmentToHtml(fragment)).toBe(html);
        });
    });

    describe(`nodesToHtml function`, () => {
        it(`can handle empty input`, () => {
            expect(nodesToHtml(null)).toBe(``);
            expect(nodesToHtml([])).toBe(``);
        });

        it(`outputs correct content`, () => {
            const d1 = document.createElement(`div`);
            d1.innerHTML = `d1`;
            const p2 = document.createElement(`p`);
            p2.innerHTML = `p2`;
            expect(nodesToHtml([d1, p2])).toBe(`<div>d1</div><p>p2</p>`);
        });
    });

    xdescribe(`getAllNextSiblings function`, () => {
        it(``, () => {
            // expect(``).toBe(``);
        });
    });

    xdescribe(`getAllPrevSiblingsReversed function`, () => {
        it(``, () => {
            // expect(``).toBe(``);
        });
    });

    describe(`addCSSClass function`, () => {
        it(`adds a class`, () => {
            const el = document.createElement(`div`);
            addCSSClass(el, `foo`);
            expect(el.outerHTML).toBe(`<div class="foo"></div>`);
        });

        it(`adds to classes`, () => {
            const el = document.createElement(`div`);
            el.classList.add(`bar`);
            addCSSClass(el, `foo`);
            expect(el.outerHTML).toBe(`<div class="bar foo"></div>`);
        });

        it(`does not add classes twice`, () => {
            const el = document.createElement(`div`);
            el.classList.add(`foo`);
            addCSSClass(el, `foo`);
            expect(el.outerHTML).toBe(`<div class="foo"></div>`);
        });

        it(`should do nothing on invalid element`, () => {
            const el = document.createTextNode(`div`);
            addCSSClass(el, `foo`);
            expect(el).toEqual(document.createTextNode(`div`));
        });
    });

    describe(`removeCSSClass function`, () => {
        it(`removes class attribute if empty`, () => {
            const el = document.createElement(`div`);
            el.classList.add(`foo`);
            removeCSSClass(el, `foo`);
            expect(el.outerHTML).toBe(`<div></div>`);
        });

        it(`removes from classes`, () => {
            const el = document.createElement(`div`);
            el.classList.add(`bar`);
            el.classList.add(`foo`);
            removeCSSClass(el, `foo`);
            expect(el.outerHTML).toBe(`<div class="bar"></div>`);
        });

        it(`should do nothing on invalid element`, () => {
            const el = document.createTextNode(`div`);
            removeCSSClass(el, `foo`);
            expect(el).toEqual(document.createTextNode(`div`));
        });
    });

    describe(`isValidInlineHtml function`, () => {
        it(`recognizes invalid tag`, () => {
            expect(isValidInlineHtml(`<1></1>`)).toBe(false);
        });

        it(`recognizes unclosed tag`, () => {
            expect(isValidInlineHtml(`<test>`)).toBe(false);
        });

        it(`recognizes unopened tag`, () => {
            expect(isValidInlineHtml(`</test>`)).toBe(false);
        });

        it(`recognizes invalid attribute`, () => {
            expect(isValidInlineHtml(`<test foo="1></test>`)).toBe(false);
        });

        it(`recognizes valid tag`, () => {
            expect(isValidInlineHtml(`<test foo="to"></test>`)).toBe(true);
        });

        it(`fails if containing block elements`, () => {
            expect(isValidInlineHtml(`<test foo="to"><div></div></test>`)).toBe(false);
        });

        it(`can handle empty input`, () => {
            expect(isValidInlineHtml(``)).toBe(true);
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

    describe(`addClassToLastNode function`, () => {
        it(`adds class`, () => {
            expect(addClassToLastNode(`<div></div>`, `bar`)).toBe(`<div class="bar"></div>`);
        });

        it(`adds class only to last node`, () => {
            expect(addClassToLastNode(`<div></div><div class="foo"></div>`, `bar`)).toBe(
                `<div></div><div class="foo bar"></div>`
            );
        });

        it(`does nothing on empty html input`, () => {
            expect(addClassToLastNode(``, `bar`)).toBe(``);
        });
    });

    describe(`addClassToHtmlTag function`, () => {
        it(`adds class attribute and class`, () => {
            expect(addClassToHtmlTag(`<div class="foo"></div>`, `bar`)).toBe(`<div class="foo bar"></div>`);
        });

        it(`adds class to existing attribute`, () => {
            expect(addClassToHtmlTag(`<div></div>`, `bar`)).toBe(`<div class="bar"></div>`);
        });

        it(`adds class to multiple tags`, () => {
            expect(addClassToHtmlTag(`<div></div><div></div>`, `bar`)).toBe(
                `<div class="bar"></div><div class="bar"></div>`
            );
        });

        it(`adds class to nested tags`, () => {
            expect(addClassToHtmlTag(`<div><div class="foo"></div></div>`, `bar`)).toBe(
                `<div class="bar"><div class="foo bar"></div></div>`
            );
        });
    });

    describe(`serializeTag function`, () => {
        it(`converts node element`, () => {
            const tag = document.createElement(`div`);
            tag.setAttribute(`foo`, `bar`);
            tag.setAttribute(`bar`, `foo`);
            tag.textContent = `Test`;

            expect(serializeTag(tag)).toBe(`<DIV foo="bar" bar="foo">`);
        });

        it(`throws error on non node element`, () => {
            const tag = document.createTextNode(`Test`);

            expect(() => serializeTag(tag)).toThrow(new Error(`Invalid node type`));
        });
    });

    describe(`sortHtmlAttributes function`, () => {
        it(`sorts attributes`, () => {
            expect(sortHtmlAttributes(`<t foo="bar" example="1"></t>`)).toBe(`<t example="1" foo="bar"></t>`);
        });

        it(`sorts empty attributes`, () => {
            expect(sortHtmlAttributes(`<t foo="bar" bar example="1"></t>`)).toBe(`<t bar example="1" foo="bar"></t>`);
        });

        it(`sorts css classes`, () => {
            expect(sortHtmlAttributes(`<t class="example bar foo"></t>`)).toBe(`<t class="bar example foo"></t>`);
        });
    });

    describe(`htmlToUppercase function`, () => {
        it(`converts html to uppercase`, () => {
            expect(htmlToUppercase(`<a href=""><b></b></a><DIv></diV>`)).toBe(`<A HREF=""><B></B></A><DIV></DIV>`);
        });

        it(`can handle self closing tags`, () => {
            expect(htmlToUppercase(`<br />`)).toBe(`<BR />`);
        });

        it(`handles empty attributes correctly`, () => {
            expect(htmlToUppercase(`<a href></a>`)).toBe(`<A HREF></A>`);
        });

        it(`does not change attribute content`, () => {
            expect(htmlToUppercase(`<a href="http://foo.bar"></a>`)).toBe(`<A HREF="http://foo.bar"></A>`);
        });

        it(`does not change tag content`, () => {
            expect(htmlToUppercase(`<a>tEst</a>`)).toBe(`<A>tEst</A>`);
        });
    });

    describe(`isInlineElement function`, () => {
        it(`recognizes inline element`, () => {
            expect(isInlineElement(document.createElement(`b`))).toBe(true);
        });

        it(`recognizes non inline element`, () => {
            expect(isInlineElement(document.createElement(`p`))).toBe(false);
        });

        it(`fails on empty input`, () => {
            expect(isInlineElement(null)).toBe(false);
        });
    });
});
