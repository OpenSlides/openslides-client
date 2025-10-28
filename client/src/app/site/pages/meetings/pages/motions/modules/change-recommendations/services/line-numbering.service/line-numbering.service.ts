import { Injectable } from '@angular/core';
import { LineNumbering } from '@openslides/motion-diff';
import { djb2hash } from 'src/app/infrastructure/utils';

import { DiffCache } from '../../../../definitions';

/**
 * A helper to indicate that certain functions expect the provided HTML strings to contain line numbers
 */
export type LineNumberedString = string;

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

interface InsertLineNumbersConfig {
    html: string;
    lineLength: number;
    firstLine: number;
    highlight?: number;
    callback?: () => void;
}

/**
 * Functionality regarding adding and removing line numbers and highlighting single lines.
 *
 * ## Examples:
 *
 * Adding line numbers to an HTML string:
 *
 * ```ts
 * const lineLength = 80;
 * const originalHtml = '<p>Lorem ipsum dolorsit amet</p>';
 * const lineNumberedHtml = this.lineNumbering.insertLineNumbers(inHtml, lineLength);
 * ```
 *
 * Removing line numbers from a line-numbered string:
 * ```ts
 * const lineNumberedHtml =
 *   '<p><span class="os-line-number line-number-1" data-line-number="1" contenteditable="false">&nbsp;</span>
 *    Lorem ipsum dolorsit amet</p>';
 * const originalHtml = this.lineNumbering.stripLineNumbers(inHtml);
 * ```
 *
 * Splitting a HTML string into an array of paragraphs:
 *
 * ```ts
 * const htmlIn = '<p>Paragraph 1</p><ul><li>Paragraph 2</li><li>Paragraph 3</li></ul>';
 * const paragraphs = this.lineNumbering.splitToParagraphs(htmlIn);
 * ```
 *
 * Retrieving all section headings from an HTML string:
 *
 * ```ts
 * const html = '<h1>Heading 1</h1><p>Some introductional paragraph</p><h2>Subheading 1.1</h2><p>Another paragraph</p>
 * const headings = this.lineNumbering.getHeadingsWithLineNumbers(html);
 * ```
 */
@Injectable({
    providedIn: `root`
})
export class LineNumberingService {
    /**
     * @TODO Decide on a more sophisticated implementation
     * This is just a stub for a caching system. The original code from Angular1 was:
     * var lineNumberCache = $cacheFactory('linenumbering.service');
     * This should be replaced by a real cache once we have decided on a caching service for OpenSlides 3
     */
    private lineNumberCache = new DiffCache();

    /**
     * Given a HTML string augmented with line number nodes, this function detects the line number range of this text.
     * This method assumes that the line number node indicating the beginning of the next line is not included anymore.
     *
     * @param {string} html
     * @returns {LineNumberRange}
     */
    public getLineNumberRange(html: string): LineNumberRange {
        return LineNumbering.getRange(html);
    }

    /**
     * Splitting the text into paragraphs:
     * - Each root-level-element is considered as a paragraph.
     *   Inline-elements at root-level are not expected and treated as block elements.
     *   Text-nodes at root-level are not expected and ignored. Every text needs to be wrapped e.g. by <p> or <div>.
     * - If a UL or OL is encountered, paragraphs are defined by the child-LI-elements.
     *   List items of nested lists are not considered as a paragraph of their own.
     *
     * @param {string} html
     * @return {string[]}
     */
    public splitToParagraphs(html: string): string[] {
        const cacheKey = djb2hash(html);
        let cachedParagraphs = this.lineNumberCache.get(cacheKey);
        if (!cachedParagraphs) {
            cachedParagraphs = LineNumbering.splitToParagraphs(html);

            this.lineNumberCache.put(cacheKey, cachedParagraphs);
        }

        return cachedParagraphs;
    }

    /**
     * Adds line number nodes to the given html string.
     * TODO: Update type
     */
    public insertLineNumbers(config: InsertLineNumbersConfig): LineNumberedString {
        let newHtml: string;

        const firstLineStr = !config.firstLine ? `` : config.firstLine.toString();
        const cacheKey = djb2hash(firstLineStr + `-` + config.lineLength.toString() + config.html);
        newHtml = this.lineNumberCache.get(cacheKey);
        if (!newHtml) {
            newHtml = LineNumbering.insert(config);
            this.lineNumberCache.put(cacheKey, newHtml);
        }

        if ((config.highlight as number) > 0) {
            return LineNumbering.highlightLine(newHtml, config.highlight);
        }

        return newHtml;
    }

    /**
     * This enforces that no line is longer than the given line Length. However, this method does not care about
     * line numbers, diff-markup etc.
     * It's mainly used to display diff-formatted text with the original line numbering, that may have longer lines
     * than the line length because of inserted text, in a context where really only a given width is available.
     *
     * @param {string} html
     * @param {number} lineLength
     * @param {boolean} countInserted
     * @returns {string}
     */
    public insertLineBreaksWithoutNumbers(html: string, lineLength: number, countInserted = false): string {
        return LineNumbering.insertLineBreaks(html, lineLength, countInserted);
    }

    /**
     * Strips line numbers from a HTML string
     *
     * @param {string} html
     * @returns {string}
     */
    public stripLineNumbers(html: string): string {
        return LineNumbering.strip(html);
    }

    /**
     * This splits all inline elements so that each line number (including preceding line breaks)
     * are located directly in a block-level element.
     * `<p><span>...[linebreak]...</span></p>`
     * is therefore converted into
     * `<p><span>...</span>[linebreak]<span>...</span></p>
     *
     * This function is mainly provided for the PDF generation
     *
     * @param {string} html
     * @returns {string}
     */
    public splitInlineElementsAtLineBreaks(html: string): string {
        return LineNumbering.splitInlineElementsAtLineBreaks(html);
    }
}
