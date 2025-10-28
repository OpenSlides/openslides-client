import { ELEMENT_NODE } from "../utils/definitions";
import { getNodeByName } from "../utils/dom-helpers";

// A regular expression that looks for line number nodes in a HTML string
export const LineNumberRangeRegexp = RegExp(/<span[^>]+data-line-number="(\d+)"/, `gi`);

/**
    * Returns true, if the given node is a OpenSlides-specific line breaking node.
    *
    * @param {Node} node
    * @returns {boolean}
    */
export function isOsLineBreakNode(node: Node): boolean {
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
export function isOsLineNumberNode(node: Node): boolean {
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
export function getLineNumberNode(fragment: DocumentFragment, lineNumber: number): Element | null {
    return fragment.querySelector(`.line-number-${lineNumber}.os-line-number`);
}
