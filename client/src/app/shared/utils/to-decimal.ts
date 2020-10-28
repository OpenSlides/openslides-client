const AMOUNT_DECIMAL_PLACES = 6;

/**
 * Converts a given number into a floating point representation of this and returns it as string.
 *
 * @param number The number to convert.
 *
 * @returns A string containing the floating point representation of the given number.
 */
export function toDecimal(number?: number): string {
    return number ? number.toFixed(AMOUNT_DECIMAL_PLACES) : undefined;
}
