import { Injectable } from '@angular/core';
import { LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';
import {
    ChildNodeParagraphPayload,
    CreateSpecificParagraphPayload,
    HtmlToPdfService
} from 'src/app/gateways/export/html-to-pdf.service';

import { MotionsExportModule } from '../motions-export.module';

/**
 * Shape of line number objects
 */
interface LineNumberObject {
    lineNumber: number;
    marginBottom?: number;
}

interface HtmlToPdfConfig {
    /**
     * the html text to translate as string
     */
    htmlText: string;
    /**
     * Determines the line numbering
     */
    lnMode?: LineNumberingMode;
    lineHeight?: number;
}

@Injectable({
    providedIn: MotionsExportModule
})
export class MotionHtmlToPdfService extends HtmlToPdfService {
    /**
     * holds the desired line number mode
     */
    private lineNumberingMode: LineNumberingMode = LineNumberingMode.Outside;

    public override addPlainText(htmlText: string): object {
        return {
            columns: [{ stack: this.convertHtml({ htmlText, lnMode: LineNumberingMode.None }) }]
        };
    }

    public override convertHtml({ htmlText, lnMode, lineHeight }: HtmlToPdfConfig): object {
        this.lineNumberingMode = lnMode || LineNumberingMode.None;

        if (lineHeight) {
            this.lineHeight = lineHeight;
        }

        // Cleanup of dirty html would happen here
        htmlText = htmlText.replace(/\s+<br class="os-line-break">/g, `<br class="os-line-break">`);

        return super.convertHtml({ htmlText });
    }

    protected override createDivParagraph(data: CreateSpecificParagraphPayload): any {
        const { element, nodeName, classes, styles } = data;
        const children = this.parseChildren(element, styles);
        let newParagraph: any;
        if (this.lineNumberingMode === LineNumberingMode.Outside && !classes.includes(`insert`) && nodeName !== `li`) {
            newParagraph = this.create(`stack`);
            newParagraph.stack = children;
            newParagraph = this.formatDivParagraph(newParagraph, data);
        } else if (nodeName === `li`) {
            newParagraph = this.create(`stack`);

            var ul = [];
            var text = [];

            // Collect all text children into one text object to make
            // multiline subitems work. All subitem children are added
            // to the stack normally.
            for (var key in children) {
                // Find subitem or subitem with line numbers object.
                if (
                    Object.keys(children[key]).includes(`ul`) ||
                    children[key][`columns`]?.some(column => Object.keys(column).includes(`ul`))
                ) {
                    ul.push(children[key]);
                } else {
                    text.push(children[key]);
                }
            }
            if (text.length) {
                newParagraph.stack.push({ text: text });
            }
            if (ul.length) {
                newParagraph.stack.push(ul);
            }
            newParagraph = this.formatDivParagraph(newParagraph, data);
        } else {
            newParagraph = super.createDivParagraph(data);
        }
        if (this.lineNumberingMode === LineNumberingMode.Outside && classes.includes(`insert`)) {
            // that is usually the case for inserted change which should appear
            // under a set of line numbers with correct alignment.
            // List items are already aligned correctly by pdfmake. Therefore, margins
            // left must be zero for them.
            if (nodeName === `li`) {
                newParagraph.margin[0] = 0;
            } else {
                newParagraph.margin[0] = 20;
            }
            newParagraph.margin[3] = this.P_MARGIN_BOTTOM;
        }

        // stop enumeration if the list was inserted
        if (classes.includes(`os-split-before`)) {
            newParagraph.listType = `none`;
        }

        // if the list ends (usually due to a new insert cr) prevent margins
        if (classes.includes(`os-split-after`) || this.withSublist(element)) {
            newParagraph.margin[3] = 0;
        }
        return newParagraph;
    }

    protected override createSpanParagraph(data: CreateSpecificParagraphPayload): any {
        const element = data.element;
        if (element.getAttribute(`data-line-number`) && !this.isInsideAList(element)) {
            if (this.lineNumberingMode === LineNumberingMode.Inside) {
                // TODO: algorithm for "inline" line numbers is not yet implemented
                return undefined;
            } else if (this.lineNumberingMode === LineNumberingMode.Outside) {
                const currentLineNumber = element.getAttribute(`data-line-number`);
                return {
                    columns: [
                        // the line number column
                        this.getLineNumberObject({ lineNumber: +currentLineNumber! }),
                        {
                            text: []
                        }
                    ]
                };
            }
        } else {
            return super.createSpanParagraph(data);
        }
    }

    protected override createListParagraph(data: CreateSpecificParagraphPayload): any {
        if (!(this.lineNumberingMode === LineNumberingMode.Outside)) {
            return super.createListParagraph(data);
        }

        const { element, nodeName, classes, styles } = data;
        const list = this.create(nodeName);

        // keep the numbers of the ol list
        if (nodeName === `ol`) {
            const start = element.getAttribute(`start`);
            if (start) {
                list.start = parseInt(start, 10);
            }
        }
        let newParagraph = list;

        // in case of line numbers and only of the list is not nested in another list.
        const lines = this.extractLineNumbers(element);

        const cleanedChildDom = this.cleanLineNumbers(element);
        const cleanedChildren = this.parseChildren(cleanedChildDom, styles);

        if (lines.length > 0) {
            const listCol: any = {
                columns: [
                    {
                        width: 20,
                        stack: []
                    }
                ],
                margin: [0, 0, 0, 0]
            };

            // if this is a "fake list" lower put it close to the element above
            if (this.isFakeList(element)) {
                listCol.margin[3] = -this.P_MARGIN_BOTTOM;
            }

            for (const line of lines) {
                if (line.lineNumber) {
                    listCol.columns[0].stack.push(this.getLineNumberObject(line));
                }
            }

            list[nodeName] = cleanedChildren;
            listCol.columns.push(list);
            newParagraph = listCol;
        } else {
            // that is usually the case for "inserted" lists during change recomendations
            list.margin = [20, 0, 0, 0];
            newParagraph = list;
            newParagraph[nodeName] = cleanedChildren;
        }
        return newParagraph;
    }

    protected override addChildNodeIntoParagraphs(paragraph: any[], data: ChildNodeParagraphPayload) {
        const { child, parent, styles } = data;
        const parsedElement = this.parseElement(child, styles);
        const firstChild = parent.firstChild as Element;

        if (
            // add the line number column
            this.lineNumberingMode === LineNumberingMode.Outside &&
            child &&
            child.classList &&
            child.classList.contains(`os-line-number`)
        ) {
            paragraph.push(parsedElement);
        } else if (
            // if the first child of the parsed element is line number
            this.lineNumberingMode === LineNumberingMode.Outside &&
            firstChild &&
            firstChild.classList &&
            firstChild.classList.contains(`os-line-number`)
        ) {
            const currentLine = paragraph.pop();
            // push the parsed element into the "text" array
            currentLine.columns[1].text.push(parsedElement);
            paragraph.push(currentLine);
        } else {
            paragraph.push(parsedElement);
        }
    }

    /**
     * Helper function to make a line-number object
     *
     * @param line and object in the shape: { lineNumber: X }
     * @returns line number as pdfmake-object
     */
    private getLineNumberObject(line: LineNumberObject): object {
        return {
            width: 20,
            text: [
                {
                    // Add a blank with the normal font size here, so in rare cases the text
                    // is rendered on the next page and the line number on the previous page.
                    text: ` `,
                    decoration: ``
                },
                {
                    text: line.lineNumber,
                    color: `gray`,
                    fontSize: 8
                }
            ],
            marginBottom: line.marginBottom,
            lineHeight: this.lineHeight
        };
    }

    /**
     * Checks if a given LI has a sublist
     */
    private withSublist(element: Element): boolean {
        if (element.nodeName.toLowerCase() === `li`) {
            const hasUl = Array.from(element.children).some(child => child.nodeName.toLowerCase() === `ul`);
            return hasUl;
        }
        return false;
    }

    /**
     * Cleans the elements children from line-number spans
     *
     * @param element a html dom tree
     * @returns a DOM element without line number spans
     */
    private cleanLineNumbers(element: Element): Element {
        const elementCopy = element.cloneNode(true) as Element;
        const children = elementCopy.childNodes;

        // using for-of did not work as expected
        for (let i = 0; i < children.length; i++) {
            if (this.getLineNumber(children[i] as Element)) {
                children[i].remove();
            }

            if (children[i]?.childNodes.length > 0) {
                const cleanChildren = this.cleanLineNumbers(children[i] as Element);
                elementCopy.replaceChild(cleanChildren, children[i]);
            }
        }

        return elementCopy;
    }

    /**
     * Helper function to extract line numbers from child elements
     *
     * TODO: Cleanup
     *
     * @param element element to check for containing line numbers (usually a list)
     * @returns a list with the line numbers
     */
    private extractLineNumbers(element: Element): LineNumberObject[] {
        let foundLineNumbers: any[] = [];
        const lineNumber = this.getLineNumber(element);
        if (lineNumber) {
            foundLineNumbers.push({ lineNumber });
        } else if (element.nodeName === `BR`) {
            // Check if there is a new line, but it does not get a line number.
            // If so, insert a dummy line, so the line numbers stays aligned with
            // the text.
            if (!this.getLineNumber(element.nextSibling as Element)) {
                foundLineNumbers.push({ lineNumber: `` });
            }
        } else {
            const children = Array.from(element.childNodes) as Element[];
            let childrenLength = children.length;
            let childrenLineNumbers: any[] = [];
            for (let i = 0; i < children.length; i++) {
                childrenLineNumbers = childrenLineNumbers.concat(this.extractLineNumbers(children[i]));
                if (children.length < childrenLength) {
                    i -= childrenLength - children.length;
                    childrenLength = children.length;
                }
            }

            // if the found element is a list item, add some spacing
            if (childrenLineNumbers.length && (element.nodeName === `LI` || element.parentNode?.nodeName === `LI`)) {
                childrenLineNumbers[childrenLineNumbers.length - 1].marginBottom = this.P_MARGIN_BOTTOM;
            }

            foundLineNumbers = foundLineNumbers.concat(childrenLineNumbers);
        }
        return foundLineNumbers;
    }

    /**
     * Recursive helper function to determine if the element is inside a list
     *
     * @param element the current html node
     * @returns wether the element is inside a list or not
     */
    private isInsideAList(element: Element): boolean {
        let parent = element.parentNode;
        while (parent !== null) {
            if (parent.nodeName === `UL` || parent.nodeName === `OL`) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    /**
     * Checks if a given UL or LI list (as element) is a "fake list"
     * Fake lists in fact lists by should appear like the parent list
     * would seamlessly continue.
     * This usually happens when a user makes change recommendations in
     * lists
     *
     * @param element the list to check, can be UL or LI
     * returns wether the list is fake or not
     */
    private isFakeList(element: Element): boolean {
        if (element.firstElementChild && element.classList.contains(`os-split-after`)) {
            // either first child has split-before or last child has split-after
            const firstChild = element.firstElementChild;
            const lastChild = element.childNodes[element.childNodes.length - 1] as Element;
            const splitBefore = firstChild.nodeName === `LI` && firstChild.classList.contains(`os-split-before`);
            const splitAfter = lastChild.nodeName === `LI` && lastChild.classList.contains(`os-split-after`);
            return splitBefore || splitAfter;
        }
        return false;
    }

    /**
     * Helper function to safer extract a line number from an element
     *
     * @param element
     * @returns the line number of the element
     */
    private getLineNumber(element: Element): number {
        if (
            element &&
            element.nodeName === `SPAN` &&
            element.getAttribute(`class`) &&
            element.getAttribute(`class`)!.indexOf(`os-line-number`) > -1
        ) {
            return parseInt(element.getAttribute(`data-line-number`)!, 10);
        }
        return 0;
    }
}
