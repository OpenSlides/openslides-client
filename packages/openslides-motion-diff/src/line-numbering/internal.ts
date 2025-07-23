import { TEXT_NODE } from "../utils/definitions";
import { findNextAuntNode, isInlineElement } from "../utils/dom-helpers";
import { isOsLineBreakNode, isOsLineNumberNode } from "./utils";

/**
  * Given a big element containing a whole document, this method splits it into editable paragraphs.
  * Each first-level LI element gets its own paragraph, as well as all root-level block elements (except for lists).
  *
  * @param {Element|DocumentFragment} node
  * @returns {Element[]}
  * @private
  */
export function splitNodeToParagraphs(node: Element | DocumentFragment): Element[] {
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
  * Helper function that does the actual work for `splitInlineElementsAtLineBreaks`
  *
  * @param {Element} lineNumber
  */
export function splitInlineElementsAtLineBreak(lineNumber: Element): void {
    const parentIsInline = (el: Element): boolean => isInlineElement(el.parentElement!);
    while (parentIsInline(lineNumber)) {
        const parent: Element = lineNumber.parentElement as Element;
        const beforeParent: Element = parent.cloneNode(false) as Element;

        // If the node right before the line number is a line break, move it outside along with the line number
        let lineBreak: Element | null = null;
        if (isOsLineBreakNode(lineNumber.previousSibling!)) {
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
  * Highlights (span[class=highlight]) all text starting from the given line number Node to the next one found.
  *
  * @param {Element} lineNumberNode
  */
export function highlightUntilNextLine(lineNumberNode: Element): void {
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

        if (currentNode.childNodes.length > 0 && !isOsLineNumberNode(currentNode) && !wasHighlighted) {
            currentNode = currentNode.childNodes[0];
        } else if (currentNode.nextSibling) {
            currentNode = currentNode.nextSibling;
        } else {
            currentNode = findNextAuntNode(currentNode) as Node;
        }

        if (isOsLineNumberNode(currentNode)) {
            foundNextLineNumber = true;
        }
    } while (!foundNextLineNumber && currentNode !== null);
}

/**
  * Removes all line number nodes from the given Node.
  *
  * @param {Node} node
  */
export function stripLineNumbersFromNode(node: Node): void {
    for (let i = 0; i < node.childNodes.length; i++) {
        if (isOsLineBreakNode(node.childNodes[i]) || isOsLineNumberNode(node.childNodes[i])) {
            // If a newline character follows a line break, it's been very likely inserted by the WYSIWYG-editor
            if (node.childNodes.length > i + 1 && node.childNodes[i + 1].nodeType === TEXT_NODE) {
                if (node.childNodes[i + 1].nodeValue![0] === `\n`) {
                    node.childNodes[i + 1].nodeValue = ` ` + node.childNodes[i + 1].nodeValue!.substring(1);
                }
            }
            node.removeChild(node.childNodes[i]);
            i--;
        } else {
            stripLineNumbersFromNode(node.childNodes[i]);
        }
    }
}
