import { Decimal } from 'app/core/definitions/key-types';

const AMOUNT_DECIMAL_PLACES = 6;

/**
 * Converts a given number into a floating point representation of this
 * with exactly six digits after a comma and returns it as string.
 *
 * @param number The number to convert.
 *
 * @returns A string containing the floating point representation of the given number.
 */
export function toDecimal(input: string | number): Decimal | null {
    if (typeof input !== `string` && typeof input !== `number`) {
        return null;
    }
    if (typeof input === `number`) {
        return input.toFixed(AMOUNT_DECIMAL_PLACES);
    }
    return parseStringToDecimal(input);
}

function parseStringToDecimal(input: string): Decimal {
    const appending = (value: string, commaIndex: number): string => {
        while (value.length - commaIndex <= AMOUNT_DECIMAL_PLACES) {
            value += `0`;
        }
        return value;
    };
    const index = input.indexOf(`.`);
    if (index > -1) {
        return appending(input, index);
    } else {
        input += `.`;
        return appending(input, input.length - 1);
    }
}
