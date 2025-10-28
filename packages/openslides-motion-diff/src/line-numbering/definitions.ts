/**
 * A helper to indicate that certain functions expect the provided HTML strings to contain line numbers
 */
export type LineNumberedString = string;

/**
 * Specifies a point within a HTML Text Node where a line break might be possible, if the following word
 * exceeds the maximum line length.
 */
export interface BreakablePoint {
    /**
     * The Text node which is a candidate to be split into two.
     */
    node: Node;
    /**
     * The exact offset of the found breakable point.
     */
    offset: number;
}

/**
 * An object specifying a range of line numbers.
 */
export interface LineNumberRange {
    /**
     * The first line number to be included.
     */
    from: number | null;
    /**
     * The end line number.
     * HINT: As this object is usually referring to actual line numbers, not lines,
     * the line starting by `to` is not included in the extracted content anymore, only the text between
     * `from` and `to`.
     */
    to: number | null;
}

/**
 * Specifies a heading element (H1, H2, H3, H4, H5, H6) within a HTML document.
 */
interface SectionHeading {
    /**
     * The first line number of this element.
     */
    lineNumber: number;
    /**
     * The nesting level. H1 = 1, H2 = 2, etc.
     */
    level: number;
    /**
     * The text content of this heading.
     */
    text: string;
}

export interface InsertLineNumbersConfig {
    html: string;
    lineLength: number;
    firstLine: number;
    highlight?: number;
    callback?: () => void;
}

