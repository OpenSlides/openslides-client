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
