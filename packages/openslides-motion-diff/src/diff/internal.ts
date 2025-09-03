import { formatDiff, replaceLines } from ".";
import { LineNumbering } from "..";
import { isOsLineBreakNode, isOsLineNumberNode } from "../line-numbering/utils";
import { DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from "../utils/definitions";
import { isFirstNonemptyChild, normalizeStyleAttributes, replaceHtmlEntities, htmlToUppercase, sortPruneHtmlAttributes } from "../utils/dom-helpers";
import { ExtractedContent } from "./definitions";
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
        const s = v?.querySelector(`:scope > .${className}`) as HTMLElement;
        if (s) {
            nextVersions.push(s);
        }
    }

    diff?.classList?.add(className);
    const nextDiffNode = diff?.querySelector(`:scope > *:not(.os-line-number)`) as HTMLElement;
    if (nextDiffNode) {
        recAddOsSplit(nextDiffNode, nextVersions, before);
    }

    if (
        diff.nextElementSibling &&
        ((diff.classList.contains(`delete`) && diff.nextElementSibling.classList.contains(`insert`)) ||
            (diff.classList.contains(`insert`) && diff.nextElementSibling.classList.contains(`delete`)))
    ) {
        diff.nextElementSibling.classList?.add(className);
        const nextSibDiffNode = diff.nextElementSibling.querySelector(`:scope > *:not(.os-line-number)`) as HTMLElement;
        if (nextSibDiffNode) {
            recAddOsSplit(nextSibDiffNode, nextVersions, before);
        }
    }
}

/**
 * This performs HTML normalization to prevent the Diff-Algorithm from detecting changes when there are actually
 * none. Common problems covered by this method are differently ordered Attributes of HTML elements or HTML-encoded
 * special characters.
 *
 * @param {string} html
 * @returns {string}
 * @private
 */
export function normalizeHtmlForDiff(html: string): string {
    html = sortPruneHtmlAttributes(html);
    html = normalizeStyleAttributes(html);
    html = htmlToUppercase(html);

    // remove whitespaces infront of closing tags
    html = html
        .replace(/\s+<\/P>/gi, `</P>`)
        .replace(/\s+<\/DIV>/gi, `</DIV>`)
        .replace(/\s+<\/LI>/gi, `</LI>`);
    html = html.replace(/\s+<LI>/gi, `<LI>`).replace(/<\/LI>\s+/gi, `</LI>`);

    html = html.replace(/\u00A0/g, ` `); // replace no break space
    html = html.replace(/\u2013/g, `-`);
    html = replaceHtmlEntities(html);

    // Newline characters: after closing block-level-elements, but not after BR (which is inline)
    html = html.replace(/(<br *\/?>)\n/gi, `$1`);
    html = html.replace(/[ \n\t]+/gi, ` `);
    html = html.replace(/(<\/(div|p|ul|li|blockquote>)>) /gi, `$1\n`);

    return html;
}

/**
 * This is a workardoun to prevent the last word of the inserted text from accidently being merged with the
 * first word of the following line.
 *
 * This happens as trailing spaces in the change recommendation's text are frequently stripped,
 * which is pretty nasty if the original text goes on after the affected line. So we insert a space
 * if the original line ends with one.
 *
 * @param {Element|DocumentFragment} element
 */
export function insertDanglingSpace(element: Element | DocumentFragment): void {
    if (element.childNodes.length > 0) {
        let lastChild = element.childNodes[element.childNodes.length - 1];
        if (
            lastChild.nodeType === TEXT_NODE &&
            !lastChild.nodeValue!.match(/[\S]/) &&
            element.childNodes.length > 1
        ) {
            // If the text node only contains whitespaces, chances are high it's just space between block elmeents,
            // like a line break between </LI> and </UL>
            lastChild = element.childNodes[element.childNodes.length - 2];
        }
        if (lastChild.nodeType === TEXT_NODE) {
            if (lastChild.nodeValue === `` || lastChild.nodeValue!.substr(-1) !== ` `) {
                lastChild.nodeValue += ` `;
            }
        } else {
            insertDanglingSpace((lastChild as Element));
        }
    }
}

/**
 * This functions merges two arrays of nodes. The last element of nodes1 and the first element of nodes2
 * are merged, if they are of the same type.
 *
 * This is done recursively until a TEMPLATE-Tag is found, which was inserted in this.replaceLines.
 * Using a TEMPLATE-Tag is a rather dirty hack, as it is allowed inside any other element, including <ul>.
 *
 * @param {Node[]} nodes1
 * @param {Node[]} nodes2
 * @returns {Node[]}
 */
export function replaceLinesMergeNodeArrays(nodes1: Node[], nodes2: Node[]): Node[] {
    if (nodes1.length === 0 || nodes2.length === 0) {
        return nodes1.length ? nodes1 : nodes2;
    }

    const out: Node[] = nodes1.slice(0, -1);
    const lastNode: Node = nodes1[nodes1.length - 1];
    const firstNode: Node = nodes2[0];
    if (lastNode.nodeType === TEXT_NODE && firstNode.nodeType === TEXT_NODE) {
        const newTextNode: Text = lastNode.ownerDocument!.createTextNode(lastNode.nodeValue! + firstNode.nodeValue);
        out.push(newTextNode);
    } else if (lastNode.nodeName === firstNode.nodeName) {
        const lastElement: Element = lastNode as Element;
        const newNode: HTMLElement = lastNode.ownerDocument!.createElement(lastNode.nodeName);

        for (const attr of Array.from(lastElement.attributes)) {
            newNode.setAttribute(attr.name, attr.value);
        }

        // Remove #text nodes inside of List elements (OL/UL), as they are confusing
        let lastChildren: Node[];
        let firstChildren: Node[];
        if (lastElement.nodeName === `OL` || lastElement.nodeName === `UL`) {
            lastChildren = Array.from(lastElement.childNodes).filter(child => child.nodeType === ELEMENT_NODE);
            firstChildren = Array.from(firstNode.childNodes).filter(child => child.nodeType === ELEMENT_NODE);
        } else {
            lastChildren = Array.from(lastElement.childNodes);
            firstChildren = Array.from(firstNode.childNodes);
        }

        const children = replaceLinesMergeNodeArrays(lastChildren, firstChildren) as Node[];
        for (const child of children) {
            newNode.appendChild(child);
        }

        out.push(newNode);
    } else {
        if (lastNode.nodeName !== `TEMPLATE`) {
            out.push(lastNode);
        }
        if (firstNode.nodeName !== `TEMPLATE`) {
            out.push(firstNode);
        }
    }

    return out.concat(nodes2.slice(1, nodes2.length));
}

/**
 * Hint: as replaceLines does not work with specific points in the text anymore, but full lines, inserting
 * only works by using the workaround of selecting a "negative line", which results in no removal.
 *
 * Only mind that the inserted HTML needs to be wrapped in similar tags to the preceding text; that is, if the
 * previous text is within a UL/LI construct and insertedHtml is supposted to be inserted within that LI,
 * it needs to be wrapped accordingly.
 */
export function insertLines(oldHtml: string, atLineNumber: number, insertedHtml: string): string {
    return replaceLines(oldHtml, insertedHtml, atLineNumber, atLineNumber - 1);
}

export function removeLines(oldHtml: string, fromLine: number, toLine: number): string {
    return replaceLines(oldHtml, ``, fromLine, toLine);
}
