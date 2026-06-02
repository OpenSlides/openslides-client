/**
 * Creates a hash of a given string. This is not meant to be specifically secure, but rather as quick as possible.
 *
 * @param {string} str
 * @returns {string}
 */
export function djb2hash(str: string): string {
    let hash = 5381;
    let char: number;
    for (let i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = (hash << 5) + hash + char;
    }
    return hash.toString();
}
