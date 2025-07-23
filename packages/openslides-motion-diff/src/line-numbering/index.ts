import { highlightUntilNextLine, splitInlineElementsAtLineBreak, splitNodeToParagraphs, stripLineNumbersFromNode } from "./internal";
import { fragmentToHtml, htmlToFragment } from "../utils/dom-helpers";
import { InsertLineNumbersConfig, LineNumberedString, LineNumberRange } from "./definitions";
import { getLineNumberNode, LineNumberRangeRegexp } from "./utils";
import { LineNumbering } from "./line-numbering";

/**
  * Given a HTML string augmented with line number nodes, this function detects the line number range of this text.
  * This method assumes that the line number node indicating the beginning of the next line is not included anymore.
  *
  * @param {string} html
  * @returns {LineNumberRange}
  */
export function getRange(html: string): LineNumberRange {
    const range: LineNumberRange = {
        from: null,
        to: null
    };

    let foundLineNumber;
    while ((foundLineNumber = LineNumberRangeRegexp.exec(html)) !== null) {
        if (range.from === null) {
            range.from = parseInt(foundLineNumber[1], 10);
        }
        range.to = parseInt(foundLineNumber[1], 10);
    }

    return range;
}

/**
  * Adds line number nodes to the given html string.
  */
export function insert({
    html,
    lineLength,
    highlight,
    firstLine = 1
}: InsertLineNumbersConfig): LineNumberedString {
    const ln = new LineNumbering(html, lineLength, firstLine, highlight ?? null);
    return ln.run().innerHTML;
}

/**
  * This enforces that no line is longer than the given line Length. However, this method does not care about
  * line numbers, diff-markup etc.
  * It's mainly used to display diff-formatted text with the original line numbering, that may have longer lines
  * than the line length because of inserted text, in a context where really only a given width is available.
  *
  * @param {string} html
  * @param {number} lineLength
  * @param {boolean} countInserted
  * @returns {string}
  */
export function insertLineBreaks(html: string, lineLength: number, countInserted: boolean = false): string {
    const ln = new LineNumbering(html, lineLength, null, null, !countInserted);
    return ln.run().innerHTML;
}

/**
  * Strips line numbers from a HTML string
  *
  * @param {string} html
  * @returns {string}
  */
export function strip(html: string): string {
    const root = document.createElement(`div`);
    root.innerHTML = html;
    stripLineNumbersFromNode(root);
    return root.innerHTML;
}

/**
  * Splitting the text into paragraphs:
  * - Each root-level-element is considered as a paragraph.
  *   Inline-elements at root-level are not expected and treated as block elements.
  *   Text-nodes at root-level are not expected and ignored. Every text needs to be wrapped e.g. by <p> or <div>.
  * - If a UL or OL is encountered, paragraphs are defined by the child-LI-elements.
  *   List items of nested lists are not considered as a paragraph of their own.
  *
  * @param {string} html
  * @return {string[]}
  */
export function splitToParagraphs(html: string): string[] {
  const fragment = htmlToFragment(html);
  return splitNodeToParagraphs(fragment).map((node: Element): string => node.outerHTML);
}

/**
  * This splits all inline elements so that each line number (including preceding line breaks)
  * are located directly in a block-level element.
  * `<p><span>...[linebreak]...</span></p>`
  * is therefore converted into
  * `<p><span>...</span>[linebreak]<span>...</span></p>
  *
  * This function is mainly provided for the PDF generation
  *
  * @param {string} html
  * @returns {string}
  */
export function splitInlineElementsAtLineBreaks(html: string): string {
    const fragment = htmlToFragment(html);
    const lineNumbers = fragment.querySelectorAll(`span.os-line-number`);
    lineNumbers.forEach((lineNumber: Element) => {
        splitInlineElementsAtLineBreak(lineNumber);
    });

    return fragmentToHtml(fragment);
}

/**
  * Highlights (span[class=highlight]) a specific line.
  *
  * @param {string} html
  * @param {number} lineNumber
  * @return {string}
  */
export function highlightLine(html: string, lineNumber: number): string {
    const fragment = htmlToFragment(html);
    const lineNumberNode = getLineNumberNode(fragment, lineNumber);

    if (lineNumberNode) {
        highlightUntilNextLine(lineNumberNode);
        html = fragmentToHtml(fragment);
    }

    return html;
}
