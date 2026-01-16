import { ELEMENT_NODE, TEXT_NODE } from "../utils/definitions";
import { isInlineElement } from "../utils/dom-helpers";
import { BreakablePoint } from "./definitions";
import { isOsLineBreakNode, isOsLineNumberNode } from "./utils";

export class LineNumbering {
    private root: HTMLDivElement = document.createElement(`div`);
    private currentInlineOffset = 0;
    private lastInlineBreakablePoint: BreakablePoint | null = null;
    private currentLineNumber: number | null;
    private prependLineNumberToFirstText = true;
    private ignoreNextRegularLineNumber = false;

    constructor(
        html: string,
        private lineLength: number,
        firstLine: number | null = 1,
        private highlightLine: number | null = null,
        private ignoreInsertedText = true
    ) {
        this.currentLineNumber = firstLine;

        // Removing newlines after BRs, as they lead to problems like #3410
        if (html) {
            html = html.replace(/(<br[^>]*>)[\n\r]+/gi, `$1`);
        }

        this.root.innerHTML = html;
    }

    public run(): Element {
        return this.insertLineNumbersToNode(this.root, this.lineLength);
    }

    /**
     * Given any node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     */
    private insertLineNumbersToNode(element: Element, length: number): Element {
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
            return this.insertLineNumbersToInlineNode(element, length);
        } else if ([`P`, `LI`].indexOf(element.tagName) !== -1 && !element.childNodes.length && this.currentLineNumber !== null) {
            const lineNumber = this.createLineNumber();
            if (lineNumber) {
                element.appendChild(lineNumber);
            }
            return element;
        } else {
            const newLength = this.calcBlockNodeLength(element, length);
            return this.insertLineNumbersToBlockNode(element, newLength);
        }
    }

    /**
     * Given a block node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     */
    private insertLineNumbersToBlockNode(element: Element, length: number): Element {
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
            if (oldChildren[i].nodeName === `BR` && (i === 0 || oldChildren[i - 1].nodeName === `BR`)) {
                const ln = this.createLineNumber();
                if (ln) {
                    element.appendChild(ln);
                }
                element.appendChild(oldChildren[i]);
            } else if (oldChildren[i].nodeType === TEXT_NODE) {
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
                const ret = this.textNodeToLines(oldChildren[i], length);
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
                const changedNode = this.insertLineNumbersToNode((oldChildren as Element[])[i], length);
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
     * Given an inline node, this method adds line numbers to it based on the current state.
     *
     * @param {Element} element
     * @param {number} length
     */
    private insertLineNumbersToInlineNode(element: Element, length: number): Element {
        const oldChildren: Node[] = [];
        for (const child of element.childNodes) {
            oldChildren.push(child);
        }

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        for (let i = 0; i < oldChildren.length; i++) {
            if (oldChildren[i].nodeType === TEXT_NODE) {
                const ret = this.textNodeToLines(oldChildren[i], length);
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
                const changedNode = this.insertLineNumbersToNode(childElement, length);
                this.moveLeadingLineBreaksToOuterNode(changedNode, element);
                element.appendChild(changedNode);
            } else {
                throw new Error(`Unknown nodeType: ` + i + `: ` + oldChildren[i]);
            }
        }

        return element;
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
    private textNodeToLines(node: Node, length: number): Element[] {
        const out: any[] = [];
        let currLineStart = 0;
        let i = 0;
        let firstTextNode = true;
        const addLine = (text: string): HTMLSpanElement | Text => {
            let lineNode: HTMLSpanElement | Text;
            if (firstTextNode) {
                if (this.highlightLine === (this.currentLineNumber as number) - 1) {
                    lineNode = document.createElement(`span`);
                    lineNode.setAttribute(`class`, `highlight`);
                    lineNode.innerHTML = text;
                } else {
                    lineNode = document.createTextNode(text);
                }
                firstTextNode = false;
            } else {
                if (this.currentLineNumber === this.highlightLine && this.highlightLine !== null) {
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
     * Moves line breaking and line numbering markup before inline elements
     *
     * @param {Element} innerNode
     * @param {Element} outerNode
     * @private
     */
    private moveLeadingLineBreaksToOuterNode(innerNode: Element, outerNode: Element): void {
        if (isInlineElement(innerNode)) {
            const firstChild = innerNode.firstChild as Element;
            if (isOsLineBreakNode(firstChild)) {
                const br = innerNode.firstChild as Node;
                innerNode.removeChild(br);
                outerNode.appendChild(br);
            }
            if (isOsLineNumberNode(firstChild)) {
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
    private calcBlockNodeLength(node: Element, oldLength: number): number {
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
        } else if (isOsLineNumberNode(element)) {
            return true;
        } else if (element.classList && element.classList.contains(`insert`)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * This creates a line number node with the next free line number.
     * If the internal flag is set, this step is skipped.
     *
     * @returns {Element}
     */
    private createLineNumber(): Element | undefined {
        if (this.ignoreNextRegularLineNumber || this.currentLineNumber == null) {
            this.ignoreNextRegularLineNumber = false;
            return undefined;
        }

        const lineNumber = this.currentLineNumber;
        (this.currentLineNumber as number)++;

        return this.getLineNumberElement(lineNumber);
    }

    private getLineNumberElement(lineNumber: number): Element {
        const el = document.createElement(`span`);
        el.appendChild(document.createTextNode(`\u00A0`)); // Prevent ckeditor from stripping out empty span's
        el.setAttribute(`class`, `line-number-${lineNumber} os-line-number`);
        el.setAttribute(`contenteditable`, `false`);
        el.setAttribute(`data-line-number`, lineNumber + ``);

        return el;
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
}
