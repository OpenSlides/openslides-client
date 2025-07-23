import { LineNumbering } from "..";
import { LineNumberedString } from "../line-numbering/definitions";
import { addCSSClass, addCSSClassToFirstTag, getCommonAncestor, getNodeContextTrace, getNthOfListItem, htmlToFragment, isFirstNonemptyChild } from "../utils/dom-helpers";
import { DiffLinesInParagraph, ExtractedContent, LineRange, UnifiedChange } from "./definitions";
import { insertInternalLineMarkers, serializeDom, serializePartialDomFromChild, serializePartialDomToChild } from "./internal";
import { getLineNumberNode, serializeTagDiff } from "./utils";

/**
  * Returns the HTML snippet between two given line numbers.
  * extractRangeByLineNumbers
  * Hint:
  * - if toLine === null, then everything from fromLine to the end of the fragment is returned
  *
  * In addition to the HTML snippet, additional information is provided regarding the most specific DOM element
  * that contains the whole section specified by the line numbers (like a P-element if only one paragraph is selected
  * or the most outer DIV, if multiple sections selected).
  *
  * This additional information is meant to render the snippet correctly without producing broken HTML
  *
  * In some cases, the returned HTML tags receive additional CSS classes, providing information both for
  * rendering it and for merging it again correctly.
  * - os-split-*:        These classes are set for all HTML Tags that have been split into two by this process,
  *                      e.g. if the fromLine- or toLine-line-break was somewhere in the middle of this tag.
  *                      If a tag is split, the first one receives "os-split-after", and the second
  *                      one "os-split-before".
  * For example, for the following string <p>Line 1<br>Line 2<br>Line 3</p>:
  * - extracting line 1 to 1 results in <p class="os-split-after">Line 1</p>
  * - extracting line 2 to 2 results in <p class="os-split-after os-split-before">Line 2</p>
  * - extracting line 3 to null/3 results in <p class="os-split-before">Line 3</p>
  *
  * @param {LineNumberedString} html
  * @param {number} fromLine
  * @param {number} toLine
  * @returns {ExtractedContent}
  */
export function extractRangeByLineNumbers(
    html: LineNumberedString,
    fromLine: number,
    toLine: number | null
): ExtractedContent {
    if (typeof html !== `string`) {
        throw new Error(`Invalid call - extractRangeByLineNumbers expects a string as first argument`);
    }

    const fragment = htmlToFragment(html);
    insertInternalLineMarkers(fragment);

    let toLineNumber: number;
    if (toLine === null) {
        const internalLineMarkers = fragment.querySelectorAll(`OS-LINEBREAK`);
        const lastMarker = internalLineMarkers[internalLineMarkers.length - 1] as Element;
        toLineNumber = parseInt(lastMarker.getAttribute(`data-line-number`) as string, 10);
    } else {
        toLineNumber = toLine + 1;
    }

    const fromLineNumberNode = getLineNumberNode(fragment, fromLine);
    const toLineNumberNode = toLineNumber ? getLineNumberNode(fragment, toLineNumber) : null;
    const ancestorData = getCommonAncestor(fromLineNumberNode as Element, toLineNumberNode as Element);

    const fromChildTraceRel = ancestorData.trace1;
    const fromChildTraceAbs = getNodeContextTrace(fromLineNumberNode as Element);
    const toChildTraceRel = ancestorData.trace2;
    const toChildTraceAbs = getNodeContextTrace(toLineNumberNode as Element);
    const ancestor = ancestorData.commonAncestor;
    let htmlOut = ``;
    let outerContextStart = ``;
    let outerContextEnd = ``;
    let innerContextStart = ``;
    let innerContextEnd = ``;
    let previousHtmlEndSnippet = ``;
    let followingHtmlStartSnippet = ``;

    fromChildTraceAbs.shift();
    const previousHtml = serializePartialDomToChild(fragment, fromChildTraceAbs, false);

    toChildTraceAbs.shift();
    const followingHtml = serializePartialDomFromChild(fragment, toChildTraceAbs, false);

    let currNode: Node = fromLineNumberNode as Element;
    let isSplit = false;
    while (currNode.parentNode) {
        if (!isFirstNonemptyChild(currNode.parentNode, currNode)) {
            isSplit = true;
        }
        if (isSplit) {
            addCSSClass(currNode.parentNode, `os-split-before`);
        }
        if (currNode.nodeName !== `OS-LINEBREAK`) {
            previousHtmlEndSnippet += `</` + currNode.nodeName + `>`;
        }
        currNode = currNode.parentNode;
    }

    currNode = toLineNumberNode as Element;
    isSplit = false;
    while (currNode.parentNode) {
        if (!isFirstNonemptyChild(currNode.parentNode, currNode)) {
            isSplit = true;
        }
        if (isSplit) {
            addCSSClass(currNode.parentNode, `os-split-after`);
        }
        if (currNode.parentNode.nodeName === `OL`) {
            const parentElement = currNode.parentNode as Element;
            const fakeOl = parentElement.cloneNode(false) as any;
            const offset = parentElement.getAttribute(`start`)
                ? parseInt(parentElement.getAttribute(`start`) as string, 10) - 1
                : 0;
            fakeOl.setAttribute(
                `start`,
                (
                    (getNthOfListItem(parentElement, toLineNumberNode as Element) as number) + offset
                ).toString()
            );
            followingHtmlStartSnippet = serializeTagDiff(fakeOl) + followingHtmlStartSnippet;
        } else {
            followingHtmlStartSnippet = serializeTagDiff(currNode.parentNode) + followingHtmlStartSnippet;
        }
        currNode = currNode.parentNode;
    }

    isSplit = false;
    for (let i = 0, found = false; i < fromChildTraceRel.length && !found; i++) {
        if (fromChildTraceRel[i].nodeName === `OS-LINEBREAK`) {
            found = true;
        } else {
            if (!isFirstNonemptyChild(fromChildTraceRel[i], fromChildTraceRel[i + 1])) {
                isSplit = true;
            }
            if (fromChildTraceRel[i].nodeName === `OL`) {
                const element = fromChildTraceRel[i] as Element;
                const fakeOl = element.cloneNode(false) as any;
                const offset = element.getAttribute(`start`)
                    ? parseInt(element.getAttribute(`start`) as string, 10) - 1
                    : 0;
                fakeOl.setAttribute(
                    `start`,
                    (
                        offset + (getNthOfListItem(element, fromLineNumberNode as Element) as number)
                    ).toString()
                );
                innerContextStart += serializeTagDiff(fakeOl);
            } else {
                if (i < fromChildTraceRel.length - 1 && isSplit) {
                    addCSSClass(fromChildTraceRel[i], `os-split-before`);
                }
                innerContextStart += serializeTagDiff(fromChildTraceRel[i]);
            }
        }
    }
    for (let i = 0, found = false; i < toChildTraceRel.length && !found; i++) {
        if (toChildTraceRel[i].nodeName === `OS-LINEBREAK`) {
            found = true;
        } else {
            innerContextEnd = `</` + toChildTraceRel[i].nodeName + `>` + innerContextEnd;
        }
    }

    for (let i = 0, found = false; i < ancestor.childNodes.length; i++) {
        if (ancestor.childNodes[i] === fromChildTraceRel[0]) {
            found = true;
            fromChildTraceRel.shift();
            htmlOut += serializePartialDomFromChild(ancestor.childNodes[i], fromChildTraceRel, true);
        } else if (ancestor.childNodes[i] === toChildTraceRel[0]) {
            found = false;
            toChildTraceRel.shift();
            htmlOut += serializePartialDomToChild(ancestor.childNodes[i], toChildTraceRel, true);
        } else if (found === true) {
            htmlOut += serializeDom(ancestor.childNodes[i], true);
        }
    }

    currNode = ancestor;
    while (currNode.parentNode) {
        if (currNode.nodeName === `OL`) {
            const currElement = currNode as Element;
            const fakeOl = currElement.cloneNode(false) as any;
            const offset = currElement.getAttribute(`start`)
                ? parseInt(currElement.getAttribute(`start`) as string, 10) - 1
                : 0;
            fakeOl.setAttribute(
                `start`,
                ((getNthOfListItem(currElement, fromLineNumberNode as Element) as any) + offset).toString()
            );
            outerContextStart = serializeTagDiff(fakeOl) + outerContextStart;
        } else {
            outerContextStart = serializeTagDiff(currNode) + outerContextStart;
        }
        outerContextEnd += `</` + currNode.nodeName + `>`;
        currNode = currNode.parentNode;
    }

    return {
        html: htmlOut,
        ancestor,
        outerContextStart,
        outerContextEnd,
        innerContextStart,
        innerContextEnd,
        previousHtml,
        previousHtmlEndSnippet,
        followingHtml,
        followingHtmlStartSnippet
    };
}

/**
  * Convenience method that takes the html-attribute from an extractRangeByLineNumbers()-method and
  * wraps it with the context.
  *
  * @param {ExtractedContent} diff
  */
export function formatDiff(diff: ExtractedContent): string {
    return (
        diff.outerContextStart + diff.innerContextStart + diff.html + diff.innerContextEnd + diff.outerContextEnd
    );
}

/**
  * This returns the line number range in which changes (insertions, deletions) are encountered.
  * As in extractRangeByLineNumbers(), "to" refers to the line breaking element at the end, i.e. the start of the
  * following line.
  *
  * TODO: This should be possible without converting the HTML to a fragment by using a regex
  *
  * @param {string} diffHtml
  * @returns {LineRange}
  */
export function detectAffectedLineRange(diffHtml: string): LineRange | null {
    throw new Error(`TODO`);
}

/**
  * Removes .delete-nodes and <del>-Tags (including content)
  * Removes the .insert-classes and the wrapping <ins>-Tags (while maintaining content)
  *
  * @param {string} html
  * @returns {string}
  */
export function diffHtmlToFinalText(html: string): string {
    throw new Error(`TODO`);
}

/**
  * Given a line numbered string (`oldHtml`), this method removes the text between `fromLine` and `toLine`
  * and replaces it by the string given by `newHTML`.
  * While replacing it, it also merges HTML tags that have been split to create the `newHTML` fragment,
  * indicated by the CSS classes .os-split-before and .os-split-after.
  *
  * This is used for creating the consolidated version of motions.
  *
  * @param {string} oldHtml
  * @param {string} newHTML
  * @param {number} fromLine
  * @param {number} toLine
  */
export function replaceLines(oldHtml: string, newHTML: string, fromLine: number, toLine: number): string {
    throw new Error(`TODO`);
}

/**
  * This function calculates the diff between two strings and tries to fix problems with the resulting HTML.
  * If lineLength and firstLineNumber is given, line numbers will be returned es well
  *
  * @param {string} htmlOld
  * @param {string} htmlNew
  * @param {number} lineLength - optional
  * @param {number} firstLineNumber - optional
  * @returns {string}
  */
export function diff(
    htmlOld: string,
    htmlNew: string,
    lineLength: number | null = null,
    firstLineNumber: number | null = null
): string {
    throw new Error(`TODO`);
}

export function readdOsSplit(diff: string, versions: string[], before = false): string {
    throw new Error(`TODO`);
}

export function changeHasCollissions(change: UnifiedChange, changes: UnifiedChange[]): boolean {
    throw new Error(`TODO`);
}

export function sortChangeRequests(changes: UnifiedChange[]): UnifiedChange[] {
    throw new Error(`TODO`);
}

/**
  * Applies all given changes to the motion and returns the (line-numbered) text
  *
  * @param {string} motionHtml
  * @param {UnifiedChange[]} changes
  * @param {number} lineLength
  * @param {boolean} showAllCollisions
  * @param {number} highlightLine
  * @param {number} firstLine
  */
export function getTextWithChanges(
    motionHtml: string,
    changes: UnifiedChange[],
    lineLength: number,
    showAllCollisions: boolean,
    highlightLine?: number,
    firstLine: number = 1
): string {
    throw new Error(`TODO`);
}

export function formatOsCollidingChanges(
    html: string,
    formatter: (el: HTMLDivElement, type: string, identifier: string, title: string, changeId: string) => void
): string {
    throw new Error(`TODO`);
}

/**
  * This is used to extract affected lines of a paragraph with the possibility to show the context (lines before
  * and after) the changed lines and displaying the line numbers.
  *
  * @param {number} paragraphNo The paragraph number
  * @param {string} origText The original text - needs to be line-numbered
  * @param {string} newText The changed text
  * @param {number} lineLength the line length
  * @param {UnifiedChange[]} changeRecos
  * @return {DiffLinesInParagraph|null}
  */
export function getAmendmentParagraphsLines(
    paragraphNo: number,
    origText: string,
    newText: string,
    lineLength: number,
    changeRecos?: UnifiedChange[]
): DiffLinesInParagraph | null {
    throw new Error(`TODO`);
}

/**
  * Returns the HTML with the changes, optionally with a highlighted line.
  * The original motion needs to be provided.
  *
  * @param {LineNumberedString} html
  * @param {UnifiedChange} change
  * @param {number} lineLength
  * @param {number} highlight
  * @returns {string}
  */
export function getChangeDiff(
    html: LineNumberedString,
    change: UnifiedChange,
    lineLength: number,
    highlight?: number
): string {
    throw new Error(`TODO`);
}

/**
  * Returns the remainder text of the motion after the last change
  *
  * @param {LineNumberedString} motionHtml
  * @param {UnifiedChange[]} changes
  * @param {number} lineLength
  * @param {number} highlight
  * @param {LineRange} lineRange
  * @returns {string}
  */
export function getTextRemainderAfterLastChange(
    motionHtml: LineNumberedString,
    changes: UnifiedChange[],
    lineLength: number,
    highlight?: number,
    lineRange?: LineRange
): string {
    if (changes.length === 0 && !lineRange) {
        return motionHtml;
    }

    let maxFromLine = lineRange?.from || (LineNumbering.getRange(motionHtml).from || 0) - 1;
    const maxToLine = lineRange?.to || LineNumbering.getRange(motionHtml).to || 0;
    let hasRemainederOneChangedLine = false;

    for (const change of changes) {
        if (change.getLineTo() > maxFromLine && change.getLineTo() <= maxToLine) {
            maxFromLine = change.getLineTo();
            hasRemainederOneChangedLine = true;
        }
    };

    if (!hasRemainederOneChangedLine) {
        return ``;
    }

    const data: ExtractedContent = extractRangeByLineNumbers(
        motionHtml,
        Math.max(maxFromLine + 1, lineRange?.from || 1),
        lineRange?.to ? maxToLine : null
    );

    let html = ``;
    if (data.html !== ``) {
        // Add "merge-before"-css-class if the first line begins in the middle of a paragraph. Used for PDF.
        html =
            addCSSClassToFirstTag(data.outerContextStart + data.innerContextStart, `merge-before`) +
            data.html +
            data.innerContextEnd +
            data.outerContextEnd;
        html = LineNumbering.insert({ html, lineLength, highlight, firstLine: maxFromLine + 1 });
    }
    return html;
}

/**
  * Extracts a renderable HTML string representing the given line number range of this motion text
  *
  * @param {LineNumberedString} motionText
  * @param {LineRange} lineRange
  * @param {boolean} lineNumbers - weather to add line numbers to the returned HTML string
  * @param {number} lineLength
  * @param {number|null} highlightedLine
  */
export function extractMotionLineRange(
    motionText: LineNumberedString,
    lineRange: LineRange,
    lineNumbers: boolean,
    lineLength: number,
    highlightedLine?: number
): string {
    throw new Error(`TODO`);
}
