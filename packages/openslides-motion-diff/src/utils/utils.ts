/**
 * Escapes a string for use as regex
 *
 * @param str
 *
 * @returns escaped string
 */
function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}

/**
 * Splits a string by a given character and keeps the seperator at
 * the given position
 *
 * Valid positions: prepend, append, between
 *
 * @param str
 * @param by
 * @param position default between
 *
 * @returns splitted string
 */
export function splitStringKeepSeperator(
    str: string,
    by: string,
    position?: `prepend` | `append` | `between` | string
): string[] {
    if (position === `prepend`) {
        return str.split(new RegExp(`(?=${escapeRegExp(by)})`, `g`));
    } else if (position === `append`) {
        return str.split(new RegExp(`(.*?${escapeRegExp(by)})`, `g`)).filter(el => el !== ``);
    }

    return str.split(new RegExp(`(${escapeRegExp(by)})`, `g`));
}
