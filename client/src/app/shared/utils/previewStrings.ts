import { stripHtmlTags } from './strip-html-tags';

/**
 * Helper to get a preview string
 *
 * @param input
 * @param size Optional. The maximum amount of characters to display.
 * @returns returns the first and last size/2 characters of a string
 */
export function getLongPreview(input: string, size: number = 300): string {
    if (!input || !input.length) {
        return ``;
    }
    if (input.length < size) {
        return stripHtmlTags(input);
    }
    return (
        stripHtmlTags(input.substring(0, size / 2 - 3)) +
        ` [...] ` +
        stripHtmlTags(input.substring(input.length - size / 2, input.length))
    );
}

/**
 * Get the first characters of a string, for preview purposes
 *
 * @param input any string
 * @returns a string with at most 50 characters
 */
export function getShortPreview(input: string): string {
    if (!input || !input.length) {
        return ``;
    }
    if (input.length > 50) {
        return stripHtmlTags(input.substring(0, 47)) + `...`;
    }
    return stripHtmlTags(input);
}
