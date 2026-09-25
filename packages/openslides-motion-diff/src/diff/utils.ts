import { ELEMENT_NODE } from "../utils/definitions";
import { getNodeByName, serializeTag } from "../utils/dom-helpers";

/**
  * Searches for the line breaking node within the given Document specified by the given lineNumber.
  * This is performed by using a querySelector.
  *
  * TODO: Align with utils from line-numbering
  * @param {DocumentFragment} fragment
  * @param {number} lineNumber
  * @returns {Element}
  */
export function getLineNumberNode(fragment: DocumentFragment, lineNumber: number): Element | null {
    return fragment?.querySelector(`os-linebreak.os-line-number.line-number-` + lineNumber);
}

/**
  * Searches for the line breaking node within the given Document that is equal or bigger than the given lineNumber.
  * The closest result is used.
  * This is performed by using a querySelector.
  *
  * @param {DocumentFragment} fragment
  * @param {number} lineNumber
  * @returns {Element}
  */
export function getLineNumberGreaterEqualNode(fragment: DocumentFragment, lineNumber: number): [Element, number] | null {
    const exactNode = getLineNumberNode(fragment, lineNumber);
    if (exactNode) {
        return [exactNode, lineNumber];
    }

    const internalLineMarkers = fragment.querySelectorAll(`OS-LINEBREAK`);
    for (const marker of internalLineMarkers) {
        const ln = parseInt(marker.getAttribute(`data-line-number`)!, 10);
        if (ln >= lineNumber) {
            return [marker, ln];
        }
    }

    return null;
}

/**
  * Searches for the line breaking node within the given Document that is equal or bigger than the given lineNumber.
  * The closest result is used.
  * This is performed by using a querySelector.
  *
  * @param {DocumentFragment} fragment
  * @param {number} lineNumber
  * @returns {Element}
  */
export function getLineNumberLessEqualNode(fragment: DocumentFragment, lineNumber: number): [Element, number] | null {
    const exactNode = getLineNumberNode(fragment, lineNumber);
    if (exactNode) {
        return [exactNode, lineNumber];
    }

    const internalLineMarkers = fragment.querySelectorAll(`OS-LINEBREAK`);
    for (let i = internalLineMarkers.length - 1; i >= 0; i--) {
        const marker = internalLineMarkers[i];
        const ln = parseInt(marker.getAttribute(`data-line-number`)!, 10);
        if (ln <= lineNumber) {
            return [marker, ln];
        }
    }

    return null;
}

/**
  * This returns the first line breaking node within the given node.
  * If none is found, `null` is returned.
  *
  * TODO: Align with utils from line-numbering
  * @param {Node} node
  * @returns {Element}
  */
export function getFirstLineNumberNode(node: Node): Element | null {
    return getNodeByName(node, `OS-LINEBREAK`);
}

/**
  * This returns the last line breaking node within the given node.
  * If none is found, `null` is returned.
  *
  * TODO: Align with utils from line-numbering
  * @param {Node} node
  * @returns {Element}
  */
export function getLastLineNumberNode(node: Node): Element | null {
    return getNodeByName(node, `OS-LINEBREAK`, true);
}

/**
  * This converts a HTML Node element into a rendered HTML string.
  *
  * TODO: Align with utils from DomHelpers
  * @param {Node} node
  * @returns {string}
  */
export function serializeTagDiff(node: Node): string {
    if (node.nodeType !== ELEMENT_NODE) {
        // Fragments are only placeholders and do not have an HTML representation
        return ``;
    }

    return serializeTag(node);
}
