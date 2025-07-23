import { LineNumberedString } from "../line-numbering/definitions";
import { DiffLinesInParagraph, ExtractedContent, LineRange, UnifiedChange } from "./definitions";

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
    throw new Error(`TODO`);
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
    throw new Error(`TODO`);
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
