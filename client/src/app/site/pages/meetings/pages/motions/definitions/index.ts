export * from './cache';
export * from './follows';
export * from './recommendation-type-names';

/**
 * This data structure is used when determining the most specific common ancestor of two HTML node
 * (`node1` and `node2`)
 * within the same Document Fragment.
 */
export interface CommonAncestorData {
    /**
     * The most specific common ancestor node.
     */
    commonAncestor: Node;
    /**
     * The nodes inbetween `commonAncestor` and the `node1` in the DOM hierarchy.
     * Empty, if node1 is a direct descendant.
     */
    trace1: Node[];
    /**
     * The nodes inbetween `commonAncestor` and the `node2` in the DOM hierarchy.
     * Empty, if node2 is a direct descendant.
     */
    trace2: Node[];
    /**
     * Starting the root node, this indicates the depth level of the `commonAncestor`.
     */
    index: number;
}

/**
 * An object produced by `extractRangeByLineNumbers``. It contains both the extracted lines as well as
 * information about the context in which these lines occur.
 * This additional information is meant to render the snippet correctly without producing broken HTML
 */
export interface ExtractedContent {
    /**
     * The HTML between the two line numbers. Line numbers and automatically set line breaks are stripped.
     * All HTML tags are converted to uppercase
     * (e.g. Line 2</LI><LI>Line3</LI><LI>Line 4 <br>)
     */
    html: string;
    /**
     * The most specific DOM element that contains the HTML snippet (e.g. a UL, if several LIs are selected)
     */
    ancestor: Node;
    /**
     * An HTML string that opens all necessary tags to get the browser into the rendering mode
     * of the ancestor element (e.g. <DIV><UL> in the case of the multiple LIs)
     */
    outerContextStart: string;
    /**
     * An HTML string that closes all necessary tags from the ancestor element (e.g. </UL></DIV>
     */
    outerContextEnd: string;
    /**
     * A string that opens all necessary tags between the ancestor and the beginning of the selection (e.g. <LI>)
     */
    innerContextStart: string;
    /**
     * A string that closes all tags after the end of the selection to the ancestor (e.g. </LI>)
     */
    innerContextEnd: string;
    /**
     * The HTML before the selected area begins (including line numbers)
     */
    previousHtml: string;
    /**
     * A HTML snippet that closes all open tags from previousHtml
     */
    previousHtmlEndSnippet: string;
    /**
     * The HTML after the selected area
     */
    followingHtml: string;
    /**
     * A HTML snippet that opens all HTML tags necessary to render "followingHtml"
     */
    followingHtmlStartSnippet: string;
}

/**
 * An object specifying a range of line numbers.
 */
export interface LineRange {
    /**
     * The first line number to be included.
     */
    from: number;
    /**
     * The end line number.
     * HINT: As this object is usually referring to actual line numbers, not lines,
     * the line starting by `to` is not included in the extracted content anymore,
     * only the text between `from` and `to`.
     */
    to: number;
}

/**
 * An object representing a paragraph with some changed lines
 */
export interface DiffLinesInParagraph {
    /**
     * The paragraph number
     */
    paragraphNo: number;
    /**
     * The first line of the paragraph
     */
    paragraphLineFrom: number;
    /**
     * The end line number (after the paragraph)
     */
    paragraphLineTo: number;
    /**
     * The first line number with changes
     */
    diffLineFrom: number;
    /**
     * The line number after the last change
     */
    diffLineTo: number;
    /**
     * The HTML of the not-changed lines before the changed ones
     */
    textPre: string;
    /**
     * The HTML of the changed lines
     */
    text: string;
    /**
     * The HTML of the not-changed lines after the changed ones
     */
    textPost: string;
}
