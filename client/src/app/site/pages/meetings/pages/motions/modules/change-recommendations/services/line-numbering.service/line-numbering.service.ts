import { Injectable } from '@angular/core';
import { djb2hash } from 'src/app/infrastructure/utils';
import {
    findNextAuntNode,
    fragmentToHtml,
    htmlToFragment,
    isInlineElement
} from 'src/app/infrastructure/utils/dom-helpers';

import { DiffCache } from '../../../../definitions';

const ELEMENT_NODE = Node.ELEMENT_NODE;
const TEXT_NODE = Node.TEXT_NODE;

/**
 * A helper to indicate that certain functions expect the provided HTML strings to contain line numbers
 */
export type LineNumberedString = string;

/**
 * Specifies a point within a HTML Text Node where a line break might be possible, if the following word
 * exceeds the maximum line length.
 */
interface BreakablePoint {
    /**
     * The Text node which is a candidate to be split into two.
     */
    node: Node;
    /**
     * The exact offset of the found breakable point.
     */
    offset: number;
}

/**
 * An object specifying a range of line numbers.
 */
export interface LineNumberRange {
    /**
     * The first line number to be included.
     */
    from: number | null;
    /**
     * The end line number.
     * HINT: As this object is usually referring to actual line numbers, not lines,
     * the line starting by `to` is not included in the extracted content anymore, only the text between
     * `from` and `to`.
     */
    to: number | null;
}

/**
 * Specifies a heading element (H1, H2, H3, H4, H5, H6) within a HTML document.
 */
interface SectionHeading {
    /**
     * The first line number of this element.
     */
    lineNumber: number;
    /**
     * The nesting level. H1 = 1, H2 = 2, etc.
     */
    level: number;
    /**
     * The text content of this heading.
     */
    text: string;
}

interface InsertLineNumbersConfig {
    html: string;
    lineLength: number;
    firstLine: number;
    highlight?: number;
    callback?: () => void;
}

/**
 * Functionality regarding adding and removing line numbers and highlighting single lines.
 *
 * ## Examples:
 *
 * Adding line numbers to an HTML string:
 *
 * ```ts
 * const lineLength = 80;
 * const originalHtml = '<p>Lorem ipsum dolorsit amet</p>';
 * const lineNumberedHtml = this.lineNumbering.insertLineNumbers(inHtml, lineLength);
 * ```
 *
 * Removing line numbers from a line-numbered string:
 * ```ts
 * const lineNumberedHtml =
 *   '<p><span class="os-line-number line-number-1" data-line-number="1" contenteditable="false">&nbsp;</span>
 *    Lorem ipsum dolorsit amet</p>';
 * const originalHtml = this.lineNumbering.stripLineNumbers(inHtml);
 * ```
 *
 * Splitting a HTML string into an array of paragraphs:
 *
 * ```ts
 * const htmlIn = '<p>Paragraph 1</p><ul><li>Paragraph 2</li><li>Paragraph 3</li></ul>';
 * const paragraphs = this.lineNumbering.splitToParagraphs(htmlIn);
 * ```
 *
 * Retrieving all section headings from an HTML string:
 *
 * ```ts
 * const html = '<h1>Heading 1</h1><p>Some introductional paragraph</p><h2>Subheading 1.1</h2><p>Another paragraph</p>
 * const headings = this.lineNumbering.getHeadingsWithLineNumbers(html);
 * ```
 */
@Injectable({
    providedIn: `root`
})
export class LineNumberingService {
    /**
     * @TODO Decide on a more sophisticated implementation
     * This is just a stub for a caching system. The original code from Angular1 was:
     * var lineNumberCache = $cacheFactory('linenumbering.service');
     * This should be replaced by a real cache once we have decided on a caching service for OpenSlides 3
     */
    private lineNumberCache = new DiffCache();

    // Counts the number of characters in the current line, beyond singe nodes.
    // Needs to be resetted after each line break and after entering a new block node.
    private currentInlineOffset: number | null = null;

    // The last position of a point suitable for breaking the line. null or an object with the following values:
    // - node: the node that contains the position. Guaranteed to be a TextNode
    // - offset: the offset of the breaking characters (like the space)
    // Needs to be resetted after each line break and after entering a new block node.
    private lastInlineBreakablePoint: BreakablePoint | null = null;

    // The line number counter
    private currentLineNumber: number | null = null;

    // Indicates that we just entered a block element and we want to add a line number without line break
    // at the beginning.
    private prependLineNumberToFirstText = false;

    // A workaround to prevent double line numbers
    private ignoreNextRegularLineNumber = false;

    // Decides if the content of inserted nodes should count as well. This is used so we can use the algorithm on a
    // text with inline diff annotations and get the same line numbering as with the original text (when set to false)
    private ignoreInsertedText = false;

    // A precompiled regular expression that looks for line number nodes in a HTML string
    private getLineNumberRangeRegexp = RegExp(/<span[^>]+data-line-number="(\d+)"/, `gi`);

    /**
     * Returns true, if the given node is a OpenSlides-specific line breaking node.
     *
     * @param {Node} node
     * @returns {boolean}
     */
    public isOsLineBreakNode(node: Node): boolean {
        let isLineBreak = false;
        if (node && node.nodeType === ELEMENT_NODE) {
            const element = node as Element;
            if (element.nodeName === `BR` && element.hasAttribute(`class`)) {
                const classes = element.getAttribute(`class`)!.split(` `);
                if (classes.indexOf(`os-line-break`) > -1) {
                    isLineBreak = true;
                }
            }
        }
        return isLineBreak;
    }

    /**
     * Returns true, if the given node is a OpenSlides-specific line numbering node.
     *
     * @param {Node} node
     * @returns {boolean}
     */
    public isOsLineNumberNode(node: Node): boolean {
        let isLineNumber = false;
        if (node && node.nodeType === ELEMENT_NODE) {
            const element = node as Element;
            if (node.nodeName === `SPAN` && element.hasAttribute(`class`)) {
                const classes = element.getAttribute(`class`)!.split(` `);
                if (classes.indexOf(`os-line-number`) > -1) {
                    isLineNumber = true;
                }
            }
        }
        return isLineNumber;
    }

    /**
     * Searches for the line breaking node within the given Document specified by the given lineNumber.
     *
     * @param {DocumentFragment} fragment
     * @param {number} lineNumber
     * @returns {Element}
     */
    private getLineNumberNode(fragment: DocumentFragment, lineNumber: number): Element | null {
        return fragment.querySelector(`.os-line-number.line-number-` + lineNumber);
    }

    /**
     * Creates a OpenSlides-specific line break Element
     *
     * @returns {Element}
     */
    private createLineBreak(): Element {
        const br = document.createElement(`br`);
        br.setAttribute(`class`, `os-line-break`);
        return br;
    }

    /**
     * Moves line breaking and line numbering markup before inline elements
     *
     * @param {Element} innerNode
     * @param {Element} outerNode
     * @private
     */
    private moveLeadingLineBreaksToOuterNode(innerNode: Element, outerNode: Element): void {
        if (isInlineElement(innerNode)) {
            const firstChild = innerNode.firstChild as Element;
            if (this.isOsLineBreakNode(firstChild)) {
                const br = innerNode.firstChild as Node;
                innerNode.removeChild(br);
                outerNode.appendChild(br);
            }
            if (this.isOsLineNumberNode(firstChild)) {
                const span = innerNode.firstChild as Node;
                innerNode.removeChild(span);
                outerNode.appendChild(span);
            }
        }
    }

    /**
     * As some elements add extra paddings/margins, the maximum line length of the contained text is not as big
     * as for text outside of this element. Based on the outside line length, this returns the new (reduced) maximum
     * line length for the given block element.
     * HINT: this makes quite some assumtions about the styling of the CSS / PDFs. But there is no way around this,
     * as line numbers have to be fixed and not depend on styling.
     *
     * @param {Element} node
     * @param {number} oldLength
     * @returns {number}
     */
    public calcBlockNodeLength(node: Element, oldLength: number): number {
        let newLength = oldLength;
        const styles = node.getAttribute(`style`);
        let padding = 0;
        switch (node.nodeName) {
            case `LI`:
                newLength -= 5;
                break;
            case `BLOCKQUOTE`:
                newLength -= 20;
                break;
            case `DIV`:
            case `P`:
                if (styles) {
                    const leftpad = styles.split(`padding-left:`);
                    if (leftpad.length > 1) {
                        padding += parseInt(leftpad[1], 10);
                    }
                    const rightpad = styles.split(`padding-right:`);
                    if (rightpad.length > 1) {
                        padding += parseInt(rightpad[1], 10);
                    }
                    newLength -= padding / 5;
                }
                break;
            case `H1`:
                newLength *= 0.66;
                break;
            case `H2`:
                newLength *= 0.75;
                break;
            case `H3`:
                newLength *= 0.85;
                break;
        }
        return Math.ceil(newLength);
    }

    /**
     * Given a HTML string augmented with line number nodes, this function detects the line number range of this text.
     * This method assumes that the line number node indicating the beginning of the next line is not included anymore.
     *
     * @param {string} html
     * @returns {LineNumberRange}
     */
    public getLineNumberRange(html: string): LineNumberRange {
        const range: LineNumberRange = {
            from: null,
            to: null
        };

        let foundLineNumber;
        while ((foundLineNumber = this.getLineNumberRangeRegexp.exec(html)) !== null) {
            if (range.from === null) {
                range.from = parseInt(foundLineNumber[1], 10);
            }
            range.to = parseInt(foundLineNumber[1], 10);
        }

        return range;
    }

    /**
     * Seaches for all H1-H6 elements within the given text and returns information about them.
     *
     * @param {string} html
     * @returns {SectionHeading[]}
     */
    public getHeadingsWithLineNumbers(html: string): SectionHeading[] {
        const fragment = htmlToFragment(html);
        const headings = [];
        const headingNodes = fragment.querySelectorAll(`h1, h2, h3, h4, h5, h6`);
        for (let i = 0; i < headingNodes.length; i++) {
            const heading = headingNodes.item(i) as HTMLElement;
            const linenumbers = heading.querySelectorAll(`.os-line-number`);
            if (linenumbers.length > 0) {
                const number = parseInt(linenumbers.item(0).getAttribute(`data-line-number`) as string, 10);
                headings.push({
                    lineNumber: number,
                    level: parseInt(heading.nodeName.substr(1), 10),
                    text: (heading.innerText ?? heading.textContent).replace(/^\s/, ``).replace(/\s$/, ``)
                });
            }
        }
        return headings.sort(
            (heading1: SectionHeading, heading2: SectionHeading): number => heading1.lineNumber - heading2.lineNumber
        );
    }

    /**
     * Given a big element containing a whole document, this method splits it into editable paragraphs.
     * Each first-level LI element gets its own paragraph, as well as all root-level block elements (except for lists).
     *
     * @param {Element|DocumentFragment} node
     * @returns {Element[]}
     * @private
     */
    public splitNodeToParagraphs(node: Element | DocumentFragment): Element[] {
        const elements = [];
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes.item(i);

            if (childNode.nodeType === TEXT_NODE) {
                continue;
            }
            if (childNode.nodeName === `UL` || childNode.nodeName === `OL`) {
                const childElement = childNode as Element;
                let start = 1;
                if (childElement.getAttribute(`start`) !== null) {
                    start = parseInt(childElement.getAttribute(`start`) as string, 10);
                }
                for (let j = 0; j < childElement.childNodes.length; j++) {
                    if (childElement.childNodes.item(j).nodeType === TEXT_NODE) {
                        continue;
                    }
                    const newParent = childElement.cloneNode(false) as Element;
                    if (childElement.nodeName === `OL`) {
                        newParent.setAttribute(`start`, start.toString());
                    }
                    newParent.appendChild(childElement.childNodes.item(j).cloneNode(true));
                    elements.push(newParent);
                    start++;
                }
            } else {
                elements.push(childNode);
            }
        }
        return elements as Element[];
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
    public splitToParagraphs(html: string): string[] {
        const cacheKey = djb2hash(html);
        let cachedParagraphs = this.lineNumberCache.get(cacheKey);
        if (!cachedParagraphs) {
            const fragment = htmlToFragment(html);
            cachedParagraphs = this.splitNodeToParagraphs(fragment).map((node: Element): string => node.outerHTML);

            this.lineNumberCache.put(cacheKey, cachedParagraphs);
        }
        return cachedParagraphs;
    }

    /**
     * Test function, only called by the tests, never from the actual app
     *
     * @param {number} offset
     * @param {number} lineNumber
     */
    public setInlineOffsetLineNumberForTests(offset: number, lineNumber: number): void {
        this.currentInlineOffset = offset;
        this.currentLineNumber = lineNumber;
    }

    /**
     * Returns debug information for the test cases
     *
     * @returns {number}
     */
    public getInlineOffsetForTests(): number | null {
        return this.currentInlineOffset;
    }

    /**
     * When calculating line numbers on a diff-marked-up text, some elements should not be considered:
     * inserted text and line numbers. This identifies such elements.
     *
     * @param {Element} element
     * @returns {boolean}
     */
    private isIgnoredByLineNumbering(element: Element): boolean {
        // TODO: Check if .insert class is really supposed to ignore this.ignoreInsertedText
        if (element.nodeName === `INS`) {
            return this.ignoreInsertedText;
        } else if (this.isOsLineNumberNode(element)) {
            return true;
        } else if (element.classList && element.classList.contains(`insert`)) {
            return true;
        } else {
            return false;
        }
    }

    private getLineNumberElement(lineNumber: number): Element {
        const el = document.createElement(`span`);
        el.appendChild(document.createTextNode(`\u00A0`)); // Prevent ckeditor from stripping out empty span's
        el.setAttribute(`contenteditable`, `false`);
        el.setAttribute(`class`, `os-line-number line-number-` + lineNumber);
        el.setAttribute(`data-line-number`, lineNumber + ``);

        return el;
    }

    /**
     * This creates a line number node with the next free line number.
     * If the internal flag is set, this step is skipped.
     *
     * @returns {Element}
     */
    private createLineNumber(): Element | undefined {
        if (this.ignoreNextRegularLineNumber) {
            this.ignoreNextRegularLineNumber = false;
            return undefined;
        }

        const lineNumber = this.currentLineNumber;
        (this.currentLineNumber as number)++;

        return this.getLineNumberElement(lineNumber);
    }

    /**
     * Splits a TEXT_NODE into an array of TEXT_NODEs and BR-Elements separating them into lines.
     * Each line has a maximum length of 'length', with one exception: spaces are accepted to exceed the length.
     * Otherwise the string is split by the last space or dash in the line.
     *
     * @param {Node} node
     * @param {number} length
     * @param {number} highlight
     */
    public textNodeToLines(node: Node, length: number, highlight: number | null = -1): Element[] {
        const out: any[] = [];
        let currLineStart = 0;
        let i = 0;
        let firstTextNode = true;
        const addLine = (text: string): HTMLSpanElement | Text => {
            let lineNode: HTMLSpanElement | Text;
            if (firstTextNode) {
                if (highlight === (this.currentLineNumber as number) - 1) {
                    lineNode = document.createElement(`span`);
                    lineNode.setAttribute(`class`, `highlight`);
                    lineNode.innerHTML = text;
                } else {
                    lineNode = document.createTextNode(text);
                }
                firstTextNode = false;
            } else {
                if (this.currentLineNumber === highlight && highlight !== null) {
                    lineNode = document.createElement(`span`);
                    lineNode.setAttribute(`class`, `highlight`);
                    lineNode.innerHTML = text;
                } else {
                    lineNode = document.createTextNode(text);
                }
                out.push(this.createLineBreak());
                if (this.currentLineNumber !== null) {
                    if (this.ignoreNextRegularLineNumber) {
                        this.ignoreNextRegularLineNumber = false;
                    } else {
                        out.push(this.createLineNumber());
                    }
                }
            }
            out.push(lineNode);
            return lineNode;
        };
        const addLinebreakToPreviousNode = (lineNode: Element, offset: number): void => {
            const firstText = lineNode.nodeValue!.substr(0, offset + 1);
            const secondText = lineNode.nodeValue!.substr(offset + 1);
            const lineBreak = this.createLineBreak();
            const firstNode = document.createTextNode(firstText);
            lineNode.parentNode!.insertBefore(firstNode, lineNode);
            lineNode.parentNode!.insertBefore(lineBreak, lineNode);
            if (this.currentLineNumber !== null) {
                lineNode.parentNode!.insertBefore(this.createLineNumber() as Element, lineNode);
            }
            lineNode.nodeValue = secondText;
        };

        if (node.nodeValue === `\n`) {
            out.push(node);
        } else {
            // This happens if a previous inline element exactly stretches to the end of the line
            if ((this.currentInlineOffset as number) >= length) {
                out.push(this.createLineBreak());
                if (this.currentLineNumber !== null) {
                    out.push(this.createLineNumber());
                }
                this.currentInlineOffset = 0;
                this.lastInlineBreakablePoint = null;
            } else if (this.prependLineNumberToFirstText) {
                if (this.ignoreNextRegularLineNumber) {
                    this.ignoreNextRegularLineNumber = false;
                } else if (this.currentLineNumber !== null) {
                    out.push(this.createLineNumber());
                }
            }
            this.prependLineNumberToFirstText = false;

            while (i < node.nodeValue!.length) {
                let lineBreakAt = null;
                if ((this.currentInlineOffset as number) >= length) {
                    if (this.lastInlineBreakablePoint !== null) {
                        lineBreakAt = this.lastInlineBreakablePoint;
                    } else {
                        lineBreakAt = {
                            node,
                            offset: i - 1
                        };
                    }
                }
                if (lineBreakAt !== null && node.nodeValue![i] !== ` ` && node.nodeValue![i] !== `\n`) {
                    if (lineBreakAt.node === node) {
                        // The last possible breaking point is in this text node
                        const currLine = node.nodeValue!.substring(currLineStart, lineBreakAt.offset + 1);
                        addLine(currLine);

                        currLineStart = lineBreakAt.offset + 1;
                        this.currentInlineOffset = i - lineBreakAt.offset - 1;
                        this.lastInlineBreakablePoint = null;
                    } else {
                        // The last possible breaking point was not in this text not, but one we have already passed
                        const remainderOfPrev = lineBreakAt.node.nodeValue!.length - lineBreakAt.offset - 1;
                        addLinebreakToPreviousNode(lineBreakAt.node as Element, lineBreakAt.offset);

                        this.currentInlineOffset = i + remainderOfPrev;
                        this.lastInlineBreakablePoint = null;
                    }
                }

                if (node.nodeValue![i] === ` ` || node.nodeValue![i] === `-` || node.nodeValue![i] === `\n`) {
                    this.lastInlineBreakablePoint = {
                        node,
                        offset: i
                    };
                }

                (this.currentInlineOffset as number)++;
                i++;
            }
            const lastLine = addLine(node.nodeValue!.substring(currLineStart));
            if (this.lastInlineBreakablePoint !== null) {
                this.lastInlineBreakablePoint.node = lastLine;
            }
        }
        return out;
    }

    /**
     * Searches recursively for the first textual word in a node and returns its length. Handy for detecting if
     * the next nested element will break the current line.
     *
     * @param {Node} node
     * @returns {number}
     */
    private lengthOfFirstInlineWord(node: Node): number {
        if (!node.firstChild) {
            return 0;
        }
        if (node.firstChild.nodeType === TEXT_NODE) {
            const parts = node.firstChild.nodeValue!.split(` `);
            return parts[0].length;
        } else {
            return this.lengthOfFirstInlineWord(node.firstChild);
        }
    }

    /**
     * Given an inline node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     * @param {number} highlight
     */
    private insertLineNumbersToInlineNode(element: Element, length: number, highlight: number | null): Element {
        const oldChildren: Node[] = [];
        for (const child of element.childNodes) {
            oldChildren.push(child);
        }

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        for (let i = 0; i < oldChildren.length; i++) {
            if (oldChildren[i].nodeType === TEXT_NODE) {
                const ret = this.textNodeToLines(oldChildren[i], length, highlight);
                for (const elem of ret) {
                    element.appendChild(elem);
                }
            } else if (oldChildren[i].nodeType === ELEMENT_NODE) {
                const childElement = oldChildren[i] as Element;
                const firstword = this.lengthOfFirstInlineWord(childElement);
                const overlength =
                    (this.currentInlineOffset as number) + firstword > length && (this.currentInlineOffset as number) > 0;
                if (overlength && isInlineElement(childElement)) {
                    this.currentInlineOffset = 0;
                    this.lastInlineBreakablePoint = null;
                    element.appendChild(this.createLineBreak());
                    if (this.currentLineNumber !== null) {
                        element.appendChild(this.createLineNumber() as Element);
                    }
                }
                const changedNode = this.insertLineNumbersToNode(childElement, length, highlight);
                this.moveLeadingLineBreaksToOuterNode(changedNode, element);
                element.appendChild(changedNode);
            } else {
                throw new Error(`Unknown nodeType: ` + i + `: ` + oldChildren[i]);
            }
        }

        return element;
    }

    /**
     * Given a block node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     * @param {number} highlight
     */
    public insertLineNumbersToBlockNode(element: Element, length: number, highlight: number | null): Element {
        this.currentInlineOffset = 0;
        this.lastInlineBreakablePoint = null;
        this.prependLineNumberToFirstText = true;

        const oldChildren = [];
        for (const child of element.childNodes) {
            oldChildren.push(child);
        }

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        for (let i = 0; i < oldChildren.length; i++) {
            if (oldChildren[i].nodeType === TEXT_NODE) {
                if (!oldChildren[i].nodeValue!.match(/\S/)) {
                    // White space nodes between block elements should be ignored
                    const prevIsBlock = i > 0 && !isInlineElement((oldChildren as Element[])[i - 1]);
                    const nextIsBlock = i < oldChildren.length - 1 && !isInlineElement((oldChildren as Element[])[i + 1]);
                    if (
                        (prevIsBlock && nextIsBlock) ||
                        (i === 0 && nextIsBlock) ||
                        (i === oldChildren.length - 1 && prevIsBlock)
                    ) {
                        element.appendChild(oldChildren[i]);
                        continue;
                    }
                }
                const ret = this.textNodeToLines(oldChildren[i], length, highlight);
                for (const elem of ret) {
                    element.appendChild(elem);
                }
            } else if (oldChildren[i].nodeType === ELEMENT_NODE) {
                const firstword = this.lengthOfFirstInlineWord(oldChildren[i]);
                const overlength = this.currentInlineOffset + firstword > length && this.currentInlineOffset > 0;
                if (
                    overlength &&
                    isInlineElement((oldChildren as Element[])[i]) &&
                    !this.isIgnoredByLineNumbering((oldChildren as Element[])[i])
                ) {
                    this.currentInlineOffset = 0;
                    this.lastInlineBreakablePoint = null;
                    element.appendChild(this.createLineBreak());
                    if (this.currentLineNumber !== null) {
                        element.appendChild(this.createLineNumber() as Element);
                    }
                }
                const changedNode = this.insertLineNumbersToNode((oldChildren as Element[])[i], length, highlight);
                this.moveLeadingLineBreaksToOuterNode(changedNode, element);
                element.appendChild(changedNode);
            } else {
                throw new Error(`Unknown nodeType: ` + i + `: ` + oldChildren[i]);
            }
        }

        this.currentInlineOffset = 0;
        this.lastInlineBreakablePoint = null;
        this.prependLineNumberToFirstText = true;
        this.ignoreNextRegularLineNumber = false;

        return element;
    }

    /**
     * Given any node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     * @param {number} highlight
     */
    public insertLineNumbersToNode(element: Element, length: number, highlight: number | null = null): Element {
        if (element.nodeType !== ELEMENT_NODE) {
            throw new Error(`This method may only be called for ELEMENT-nodes: ` + element.nodeValue);
        }
        if (this.isIgnoredByLineNumbering(element)) {
            if (this.currentInlineOffset === 0 && this.currentLineNumber !== null && isInlineElement(element)) {
                const lineNumberNode = this.createLineNumber();
                if (lineNumberNode) {
                    element.insertBefore(lineNumberNode, element.firstChild);
                    this.ignoreNextRegularLineNumber = true;
                }
            }
            return element;
        } else if (isInlineElement(element)) {
            return this.insertLineNumbersToInlineNode(element, length, highlight);
        } else if ([`P`, `LI`].indexOf(element.tagName) !== -1 && !element.childNodes.length && this.currentLineNumber !== null) {
            const lineNumber = this.createLineNumber();
            if (lineNumber) {
                element.appendChild(lineNumber);
            }
            return element;
        } else {
            const newLength = this.calcBlockNodeLength(element, length);
            return this.insertLineNumbersToBlockNode(element, newLength, highlight);
        }
    }

    /**
     * Removes all line number nodes from the given Node.
     *
     * @param {Node} node
     */
    public stripLineNumbersFromNode(node: Node): void {
        for (let i = 0; i < node.childNodes.length; i++) {
            if (this.isOsLineBreakNode(node.childNodes[i]) || this.isOsLineNumberNode(node.childNodes[i])) {
                // If a newline character follows a line break, it's been very likely inserted by the WYSIWYG-editor
                if (node.childNodes.length > i + 1 && node.childNodes[i + 1].nodeType === TEXT_NODE) {
                    if (node.childNodes[i + 1].nodeValue![0] === `\n`) {
                        node.childNodes[i + 1].nodeValue = ` ` + node.childNodes[i + 1].nodeValue!.substring(1);
                    }
                }
                node.removeChild(node.childNodes[i]);
                i--;
            } else {
                this.stripLineNumbersFromNode(node.childNodes[i]);
            }
        }
    }

    /**
     * Adds line number nodes to the given Node.
     *
     * @param {string} html
     * @param {number|string} lineLength
     * @param {number|null} highlight - optional
     * @param {number|null} firstLine
     */
    public insertLineNumbersNode(html: string, lineLength: number, highlight: number | null, firstLine = 1): Element {
        // Removing newlines after BRs, as they lead to problems like #3410
        if (html) {
            html = html.replace(/(<br[^>]*>)[\n\r]+/gi, `$1`);
        }

        const root = document.createElement(`div`);
        root.innerHTML = html;

        this.currentInlineOffset = 0;
        this.lastInlineBreakablePoint = null;
        this.currentLineNumber = firstLine;
        this.prependLineNumberToFirstText = true;
        this.ignoreNextRegularLineNumber = false;
        this.ignoreInsertedText = true;

        return this.insertLineNumbersToNode(root, lineLength, highlight);
    }

    /**
     * Adds line number nodes to the given html string.
     */
    public insertLineNumbers({
        html,
        lineLength,
        highlight,
        firstLine = 1
    }: InsertLineNumbersConfig): LineNumberedString {
        let newHtml: string;
        let newRoot: Element;

        const firstLineStr = !firstLine ? `` : firstLine.toString();
        const cacheKey = djb2hash(firstLineStr + `-` + lineLength.toString() + html);
        newHtml = this.lineNumberCache.get(cacheKey);

        if (!newHtml) {
            newRoot = this.insertLineNumbersNode(html, lineLength, null, firstLine);
            newHtml = newRoot.innerHTML;
            this.lineNumberCache.put(cacheKey, newHtml);
        }

        if ((highlight as number) > 0) {
            newHtml = this.highlightLine(newHtml, highlight);
        }

        return newHtml;
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
    public insertLineBreaksWithoutNumbers(html: string, lineLength: number, countInserted = false): string {
        const root = document.createElement(`div`);
        root.innerHTML = html;

        this.currentInlineOffset = 0;
        this.lastInlineBreakablePoint = null;
        this.currentLineNumber = null;
        this.prependLineNumberToFirstText = true;
        this.ignoreNextRegularLineNumber = false;
        this.ignoreInsertedText = !countInserted;

        const newRoot = this.insertLineNumbersToNode(root, lineLength, null);

        return newRoot.innerHTML;
    }

    /**
     * Strips line numbers from a HTML string
     *
     * @param {string} html
     * @returns {string}
     */
    public stripLineNumbers(html: string): string {
        const root = document.createElement(`div`);
        root.innerHTML = html;
        this.stripLineNumbersFromNode(root);
        return root.innerHTML;
    }

    /**
     * Highlights (span[class=highlight]) all text starting from the given line number Node to the next one found.
     *
     * @param {Element} lineNumberNode
     */
    public highlightUntilNextLine(lineNumberNode: Element): void {
        let currentNode: Node = lineNumberNode;
        let foundNextLineNumber = false;

        do {
            let wasHighlighted = false;
            if (currentNode.nodeType === TEXT_NODE) {
                const node = document.createElement(`span`);
                node.setAttribute(`class`, `highlight`);
                node.innerHTML = currentNode.nodeValue as string;
                currentNode.parentNode!.insertBefore(node, currentNode);
                currentNode.parentNode!.removeChild(currentNode);
                currentNode = node;
                wasHighlighted = true;
            } else {
                wasHighlighted = false;
            }

            if (currentNode.childNodes.length > 0 && !this.isOsLineNumberNode(currentNode) && !wasHighlighted) {
                currentNode = currentNode.childNodes[0];
            } else if (currentNode.nextSibling) {
                currentNode = currentNode.nextSibling;
            } else {
                currentNode = findNextAuntNode(currentNode) as Node;
            }

            if (this.isOsLineNumberNode(currentNode)) {
                foundNextLineNumber = true;
            }
        } while (!foundNextLineNumber && currentNode !== null);
    }

    /**
     * Highlights (span[class=highlight]) a specific line.
     *
     * @param {string} html
     * @param {number} lineNumber
     * @return {string}
     */
    public highlightLine(html: string, lineNumber: number): string {
        const fragment = htmlToFragment(html);
        const lineNumberNode = this.getLineNumberNode(fragment, lineNumber);

        if (lineNumberNode) {
            this.highlightUntilNextLine(lineNumberNode);
            html = fragmentToHtml(fragment);
        }

        return html;
    }

    /**
     * Helper function that does the actual work for `splitInlineElementsAtLineBreaks`
     *
     * @param {Element} lineNumber
     */
    private splitInlineElementsAtLineBreak(lineNumber: Element): void {
        const parentIsInline = (el: Element): boolean => isInlineElement(el.parentElement!);
        while (parentIsInline(lineNumber)) {
            const parent: Element = lineNumber.parentElement as Element;
            const beforeParent: Element = parent.cloneNode(false) as Element;

            // If the node right before the line number is a line break, move it outside along with the line number
            let lineBreak: Element | null = null;
            if (this.isOsLineBreakNode(lineNumber.previousSibling!)) {
                lineBreak = lineNumber.previousSibling as Element;
                lineBreak.remove();
            }

            // All nodes before the line break / number are moved into beforeParent
            while (lineNumber.previousSibling) {
                const previousSibling = lineNumber.previousSibling;
                parent.removeChild(previousSibling);
                if (beforeParent.childNodes.length > 0) {
                    beforeParent.insertBefore(previousSibling, beforeParent.firstChild);
                } else {
                    beforeParent.appendChild(previousSibling);
                }
            }

            // Insert beforeParent before the parent
            if (beforeParent.childNodes.length > 0) {
                parent.parentElement!.insertBefore(beforeParent, parent);
            }

            // Add the line number and (if found) the line break inbetween
            if (lineBreak) {
                parent.parentElement!.insertBefore(lineBreak, parent);
            }
            parent.parentElement!.insertBefore(lineNumber, parent);
        }
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
    public splitInlineElementsAtLineBreaks(html: string): string {
        const fragment = htmlToFragment(html);
        const lineNumbers = fragment.querySelectorAll(`span.os-line-number`);
        lineNumbers.forEach((lineNumber: Element) => {
            this.splitInlineElementsAtLineBreak(lineNumber);
        });

        return fragmentToHtml(fragment);
    }
}
