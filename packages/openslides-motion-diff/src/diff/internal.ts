import { isOsLineBreakNode, isOsLineNumberNode } from "../line-numbering/utils";
import { DOCUMENT_FRAGMENT_NODE, TEXT_NODE } from "../utils/definitions";
import { isFirstNonemptyChild } from "../utils/dom-helpers";
import { serializeTagDiff } from "./utils";

/**
  * Adds elements like <OS-LINEBREAK class="os-line-number line-number-23" data-line-number="23"/>
  * to a given fragment
  *
  * @param {DocumentFragment} fragment
  */
export function insertInternalLineMarkers(fragment: DocumentFragment): void {
    if (fragment.querySelectorAll(`OS-LINEBREAK`).length > 0) {
        // Prevent duplicate calls
        return;
    }

    const lineNumbers = fragment.querySelectorAll(`span.os-line-number`);
    let maxLineNumber = 0;

    lineNumbers.forEach((insertBefore: Node) => {
        const lineNumberElement = insertBefore as Element;
        while (
            insertBefore.parentNode?.nodeType !== DOCUMENT_FRAGMENT_NODE &&
            isFirstNonemptyChild(insertBefore.parentNode!, insertBefore)
        ) {
            insertBefore = insertBefore.parentNode!;
        }
        insertBefore.parentNode?.insertBefore(
            getLineMarker(
                parseInt(lineNumberElement.getAttribute(`data-line-number`) || ``),
                lineNumberElement.getAttribute(`class`) || undefined
            ),
            insertBefore
        );
        maxLineNumber = parseInt(lineNumberElement.getAttribute(`data-line-number`) as string, 10);
    });

    // Add one more "fake" line number at the end and beginning, so we can select the last line as well
    fragment.appendChild(getLineMarker(maxLineNumber + 1));
    fragment.insertBefore(getLineMarker(0), fragment.firstChild);
}

/**
    * Returns a os linebreak element
    * Example: <OS-LINEBREAK class="os-line-number line-number-23" data-line-number="23"/>
    */
export function getLineMarker(lineNumber: number, classes?: string): Node {
    const lineMarker = document.createElement(`OS-LINEBREAK`);
    lineMarker.setAttribute(`data-line-number`, lineNumber.toString(10));
    lineMarker.setAttribute(`class`, classes ?? `os-line-number line-number-` + lineNumber.toString(10));

    return lineMarker;
}

/**
    * Given a DOM tree and a specific node within that tree, this method returns the HTML string from the beginning
    * of this tree up to this node.
    * The returned string in itself is not renderable, as it stops in the middle of the complete HTML, with
    * opened tags.
    *
    * Implementation hint: the first element of "toChildTrace" array needs to be a child element of "node"
    * @param {Node} node
    * @param {Node[]} toChildTrace
    * @param {boolean} stripLineNumbers
    * @returns {string}
    */
export function serializePartialDomToChild(node: Node, toChildTrace: Node[], stripLineNumbers: boolean): string {
    if (toChildTrace.length === 0) {
        return ``;
    }
    if (isOsLineNumberNode(node) || isOsLineBreakNode(node)) {
        return ``;
    }
    if (node.nodeName === `OS-LINEBREAK`) {
        return ``;
    }

    let html = serializeTagDiff(node);
    let found = false;

    for (let i = 0; i < node.childNodes.length && !found; i++) {
        if (node.childNodes[i] === toChildTrace[0]) {
            found = true;
            const childElement = node.childNodes[i] as Element;
            const remainingTrace = toChildTrace;
            remainingTrace.shift();
            if (!isOsLineNumberNode(childElement) && remainingTrace.length > 0) {
                html += serializePartialDomToChild(childElement, remainingTrace, stripLineNumbers);
            }
        } else if (node.childNodes[i].nodeType === TEXT_NODE) {
            html += node.childNodes[i].nodeValue;
        } else {
            const childElement = node.childNodes[i] as Element;
            if (
                !stripLineNumbers ||
                (!isOsLineNumberNode(childElement) &&
                    !isOsLineBreakNode(childElement))
            ) {
                html += serializeDom(childElement, stripLineNumbers);
            }
        }
    }
    if (!found) {
        throw new Error(`Inconsistency or invalid call of this function detected (to)`);
    }
    return html;
}

/**
    * Given a DOM tree and a specific node within that tree, this method returns the HTML string beginning after this
    * node to the end of the tree.
    * The returned string in itself is not renderable, as it starts in the middle of the complete HTML
    * with opened tags.
    *
    * Implementation hint: the first element of "fromChildTrace" array needs to be a child element of "node"
    * @param {Node} node
    * @param {Node[]} fromChildTrace
    * @param {boolean} stripLineNumbers
    * @returns {string}
    */
export function serializePartialDomFromChild(node: Node, fromChildTrace: Node[], stripLineNumbers: boolean): string {
    if (fromChildTrace.length === 0) {
        return ``;
    }
    if (isOsLineNumberNode(node) || isOsLineBreakNode(node)) {
        return ``;
    }
    if (node.nodeName === `OS-LINEBREAK`) {
        return ``;
    }

    let html = ``;
    let found = false;
    for (const child of node.childNodes) {
        if (child === fromChildTrace[0]) {
            found = true;
            const childElement = child as Element;
            const remainingTrace = fromChildTrace;
            remainingTrace.shift();
            if (!isOsLineNumberNode(childElement) && remainingTrace.length > 0) {
                html += serializePartialDomFromChild(childElement, remainingTrace, stripLineNumbers);
            }
        } else if (found) {
            if (child.nodeType === TEXT_NODE) {
                html += child.nodeValue;
            } else {
                const childElement = child as Element;
                if (
                    !stripLineNumbers ||
                    (!isOsLineNumberNode(childElement) &&
                        !isOsLineBreakNode(childElement))
                ) {
                    html += serializeDom(childElement, stripLineNumbers);
                }
            }
        }
    }
    if (!found) {
        throw new Error(`Inconsistency or invalid call of this function detected (from)`);
    }
    if (node.nodeType !== DOCUMENT_FRAGMENT_NODE) {
        html += `</` + node.nodeName + `>`;
    }

    return html;
}

/**
    * Converts a given HTML node into HTML string and optionally strips line number nodes from it.
    *
    * @param {Node} node
    * @param {boolean} stripLineNumbers
    * @returns {string}
    */
export function serializeDom(node: Node, stripLineNumbers: boolean): string {
    if (node.nodeType === TEXT_NODE) {
        return node.nodeValue!.replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
    }
    if (
        stripLineNumbers &&
        (isOsLineNumberNode(node) || isOsLineBreakNode(node))
    ) {
        return ``;
    }
    if (node.nodeName === `OS-LINEBREAK`) {
        return ``;
    }
    if (node.nodeName === `BR`) {
        const element = node as Element;
        let br = `<BR`;
        for (const attibutes of element.attributes) {
            const attr = attibutes;
            br += ` ` + attr.name + `="` + attr.value + `"`;
        }
        return br + `>`;
    }

    let html = serializeTagDiff(node);
    for (const child of node.childNodes) {
        if (child.nodeType === TEXT_NODE) {
            html += child
                .nodeValue!.replace(/&/g, `&amp;`)
                .replace(/</g, `&lt;`)
                .replace(/>/g, `&gt;`);
        } else {
            html += serializeDom(child, stripLineNumbers);
        }
    }
    if (node.nodeType !== DOCUMENT_FRAGMENT_NODE) {
        html += `</` + node.nodeName + `>`;
    }

    return html;
}

export function recAddOsSplit(diff: HTMLElement, versions: HTMLElement[], before = false): void {
    const className = before ? `os-split-before` : `os-split-after`;
    let containsSplit = false;
    for (const v of versions) {
        if (v?.classList.contains(className)) {
            containsSplit = true;
        }
    }

    if (!containsSplit) {
        return;
    }

    const nextVersions: HTMLElement[] = [];
    for (const v of versions) {
        const s = v?.querySelector(`& > .${className}`) as HTMLElement;
        if (s) {
            nextVersions.push(s);
        }
    }

    diff?.classList?.add(className);
    const nextDiffNode = diff?.querySelector(`& > *:not(.os-line-number)`) as HTMLElement;
    if (nextDiffNode) {
        recAddOsSplit(nextDiffNode, nextVersions, before);
    }

    if (
        diff.nextElementSibling &&
        ((diff.classList.contains(`delete`) && diff.nextElementSibling.classList.contains(`insert`)) ||
            (diff.classList.contains(`insert`) && diff.nextElementSibling.classList.contains(`delete`)))
    ) {
        diff.nextElementSibling.classList?.add(className);
        const nextSibDiffNode = diff.nextElementSibling.querySelector(`& > *:not(.os-line-number)`) as HTMLElement;
        if (nextSibDiffNode) {
            recAddOsSplit(nextSibDiffNode, nextVersions, before);
        }
    }
}
