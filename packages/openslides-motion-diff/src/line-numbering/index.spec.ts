import { describe, expect, it } from "vitest";
import { brMarkup, noMarkup } from "./test-utils";
import { getRange, splitInlineElementsAtLineBreaks, splitToParagraphs } from ".";

describe(`getting line number range`, () => {
    it(`extracts the line number range, example 1`, () => {
        const html =
            `<p>` +
            noMarkup(2) +
            `et accusam et justo duo dolores et ea <span style="color: #ff0000;"><strike>rebum </strike></span><span style="color: #006400;">Inserted Text</span>. Stet clita kasd ` +
            brMarkup(3) +
            `gubergren,</p>`;
        const range = getRange(html);
        expect(range).toEqual({ from: 2, to: 3 });
    });
});

describe(`paragraph splitting`, () => {
    it(`breaks simple DIVs`, () => {
        const htmlIn = `<DIV class="testclass">Test <strong>1</strong></DIV>` + `\n` + `<p>Test <em>2</em> 3</p>`;
        const out = splitToParagraphs(htmlIn);
        expect(out.length).toBe(2);
        expect(out[0]).toBe(`<div class="testclass">Test <strong>1</strong></div>`);
        expect(out[1]).toBe(`<p>Test <em>2</em> 3</p>`);
    });
    it(`ignores root-level text-nodes`, () => {
        const htmlIn = `<DIV class="testclass">Test <strong>3</strong></DIV>` + `\n New line`;
        const out = splitToParagraphs(htmlIn);
        expect(out.length).toBe(1);
        expect(out[0]).toBe(`<div class="testclass">Test <strong>3</strong></div>`);
    });
    it(`splits UL-Lists`, () => {
        const htmlIn = `<UL class='testclass'>\n<li>Node 1</li>\n  <li class='second'>Node <strong>2</strong></li><li><p>Node 3</p></li></UL>`;
        const out = splitToParagraphs(htmlIn);
        expect(out.length).toBe(3);
        expect(out[0]).toBe(`<ul class="testclass"><li>Node 1</li></ul>`);
        expect(out[1]).toBe(`<ul class="testclass"><li class="second">Node <strong>2</strong></li></ul>`);
        expect(out[2]).toBe(`<ul class="testclass"><li><p>Node 3</p></li></ul>`);
    });
    it(`splits OL-Lists`, () => {
        const htmlIn = `<OL start='2' class='testclass'>\n<li>Node 1</li>\n  <li class='second'>Node <strong>2</strong></li><li><p>Node 3</p></li></OL>`;
        const out = splitToParagraphs(htmlIn);
        expect(out.length).toBe(3);
        expect(out[0]).toBe(`<ol start="2" class="testclass"><li>Node 1</li></ol>`);
        expect(out[1]).toBe(`<ol start="3" class="testclass"><li class="second">Node <strong>2</strong></li></ol>`);
        expect(out[2]).toBe(`<ol start="4" class="testclass"><li><p>Node 3</p></li></ol>`);
    });
});

describe(`inline element at line break splitting`, () => {
    it(`splits inline tags`, () => {
        const inHtml =
            `<ul><li><p><span class="test"><strong>` +
            noMarkup(1) +
            `Line 1` +
            brMarkup(2) +
            `<em>Line 2` +
            brMarkup(3) +
            `Line 3</em>` +
            `</strong></span></p></li></ul>`;
        const stripped = splitInlineElementsAtLineBreaks(inHtml);
        expect(stripped).toBe(
            `<ul><li><p>` +
            noMarkup(1) +
            `<span class="test"><strong>Line 1</strong></span>` +
            brMarkup(2) +
            `<span class="test"><strong><em>Line 2</em></strong></span>` +
            brMarkup(3) +
            `<span class="test"><strong><em>Line 3</em></strong></span>` +
            `</p></li></ul>`
        );
    });
});
