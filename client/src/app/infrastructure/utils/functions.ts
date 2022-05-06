import { Decimal } from '../../domain/definitions/key-types';

export function toBase64(data: File | Blob): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
            const resultStr: string = reader.result as string;
            resolve(resultStr.split(`,`)[1]);
        };
        reader.onerror = error => {
            reject(error);
        };
    });
}

/**
 * This function converts german umlauts back.
 *
 * @param text
 *
 * @returns {string} The whole text with german umlauts.
 */
export function reconvertChars(text: string): string {
    return text
        .replace(/&auml;|&#228;/g, `ä`)
        .replace(/&Auml;|&#196;/g, `Ä`)
        .replace(/&ouml;|&#246;/g, `ö`)
        .replace(/&Ouml;|&#214;/g, `Ö`)
        .replace(/&uuml;/g, `ü`)
        .replace(/&Uuml;/g, `Ü`)
        .replace(/&aring;|&#229;/g, `å`)
        .replace(/&Aring;|&#197;/g, `Å`)
        .replace(/&szlig;|&#223;/g, `ß`);
}

/**
 * Helper to remove html tags from a string.
 * CAUTION: It is just a basic "don't show distracting html tags in a
 * preview", not an actual tested sanitizer!
 *
 * @param inputString
 */
export function stripHtmlTags(inputString: string): string {
    const regexp = new RegExp(/<[^ ][^<>]*(>|$)/g);
    return inputString.replace(regexp, ``).trim();
}

const VERBOSE_TRUE_FIELDS = [`1`, `y`, `yes`, `true`, `on`];

export function toBoolean(value: string): boolean {
    return VERBOSE_TRUE_FIELDS.includes(value.toLowerCase());
}

export const VoidFn = () => {};

const AMOUNT_DECIMAL_PLACES = 6;

/**
 * Converts a given number into a floating point representation of this
 * with exactly six digits after a comma and returns it as string.
 *
 * @param input The number to convert.
 *
 * @returns A string containing the floating point representation of the given number.
 */
export function toDecimal(input: string | number | undefined): Decimal | undefined {
    if ((typeof input !== `string` || !input?.length) && typeof input !== `number`) {
        return undefined;
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

export function isEasterEggTime(): boolean {
    const now = new Date();
    return now.getMonth() === 3 && now.getDate() === 1;
}

const MILLIMETERS_PER_INCH = 25.4;
/**
 * Calculates millimeters in points for pdfmake.
 *
 * @param mm number of millimeters
 * @param dense Passing optional the number of pixels per inch.
 * Defaults to 72. 300 is the average number of pixels for scanners.
 *
 * @return points
 */
export function mmToPoints(mm: number, dense: number = 72): number {
    const inches = mm / MILLIMETERS_PER_INCH;
    return inches * dense;
}

/**
 * Compares two numbers.
 * @param a the first number
 * @param b the number that needs to be compared with a
 * @returns 0 if they are equal, a negative value if a>b, else a positive value
 */
export function compareValues(a: number, b: number): number {
    if (!b) {
        if (!a) {
            return 0;
        }
        return -1;
    }
    if (!a) {
        return 1;
    }
    return b - a;
}
