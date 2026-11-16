/**
 * Creates a hash of a given string. This is not meant to be specifically secure, but rather as quick as possible.
 *
 * @param {string} str
 * @returns {string}
 */
export function djb2hash(str: string): string {
    let hash = 5381n;
    for (const byte of new TextEncoder().encode(str)) {
        hash = ((hash << 5n) + hash + BigInt(byte)) & 0xffffffffffffffffn;
    }

    return hash.toString();
}
