import { DOCUMENT_FRAGMENT_NODE } from "../utils/definitions";
import { isFirstNonemptyChild } from "../utils/dom-helpers";

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

