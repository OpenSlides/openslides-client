import { Identifiable } from 'src/app/domain/interfaces';

import { Decimal, Id } from '../../domain/definitions/key-types';

export function toBase64(data: File | Blob): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const resultStr: string = reader.result as string;
            resolve(resultStr.split(`,`)[1]);
        };
        reader.onerror = error => {
            reject(error);
        };
        reader.readAsDataURL(data);
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
    return inputString.replace(regexp, ` `).replace(/  +/g, ` `).trim();
}

const VERBOSE_TRUE_FIELDS = [`1`, `on`, `true`];

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
 * @param returnNull If this is set to false, undefined will be returned instead of null.
 *
 * @returns A string containing the floating point representation of the given number.
 */
export function toDecimal(input: string | number | undefined, returnNull = true): Decimal | null {
    if (typeof input === `string` && Number.isNaN(Number(input))) {
        throw new Error(`Can't convert "${input}" to number`);
    }
    if ((typeof input !== `string` || !input?.length) && typeof input !== `number`) {
        return returnNull ? null : undefined;
    }
    return (typeof input === `number` ? input : +input).toFixed(AMOUNT_DECIMAL_PLACES);
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
    input = stripHtmlTags(input);
    if (input.length <= size) {
        return input;
    }
    return (
        input.substring(0, Math.floor(size / 2) - 3).trim() +
        ` [...] ` +
        input.substring(input.length - Math.ceil(size / 2) + 4, input.length).trim()
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
    input = stripHtmlTags(input);
    if (input.length > 50) {
        return input.substring(0, 47).trim() + `...`;
    }
    return input;
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
export function compareNumber(a: number, b: number): number {
    if (b == null) {
        if (a == null) {
            return 0;
        }
        return -1;
    }
    if (a == null) {
        return 1;
    }
    return b - a;
}

/**
 * Checks, if a given value is either null, undefined, has no keys or entries
 *
 * @param instance
 *
 * @returns A boolean if so
 */
export function isEmpty(instance: any): boolean {
    if (instance === null || instance === undefined) {
        return true;
    }
    if (Array.isArray(instance) && instance.length === 0) {
        return true;
    }
    if (typeof instance === `object` && Object.keys(instance).length === 0) {
        return true;
    }
    return false;
}

/**
 * Escapes a string for use as regex
 *
 * @param str
 *
 * @returns escaped string
 */
export function escapeRegExp(str: string): string {
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
    position?: 'prepend' | 'append' | 'between' | string
): string[] {
    if (position === `prepend`) {
        return str.split(new RegExp(`(?=${escapeRegExp(by)})`, `g`));
    } else if (position === `append`) {
        return str.split(new RegExp(`(.*?${escapeRegExp(by)})`, `g`)).filter(el => el !== ``);
    }

    return str.split(new RegExp(`(${escapeRegExp(by)})`, `g`));
}

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
        // tslint:disable-next-line:no-bitwise
        hash = (hash << 5) + hash + char;
    }
    return hash.toString();
}

/**
 * Joins two typed arrays together
 *
 * @param {TypeArray} type Type of the array
 * @param {TypeArray} a part one
 * @param {TypeArray} b part two
 */
export function joinTypedArrays<
    T extends
        | Int8Array
        | Uint8Array
        | Uint8ClampedArray
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | Float32Array
        | Float64Array
>(type: { new (len: number): T }, a: T, b: T): T {
    const res = new type(a.length + b.length);
    res.set(a);
    res.set(b, a.length);

    return res;
}

/**
 * Splits a typed array by a given seperator including the
 * seperator at the end of every return array
 *
 * @param {TypeArray} type Type of the array
 * @param {TypeArray} seperator
 * @param {TypeArray} arr The array to seperate
 */
export function splitTypedArray<
    T extends
        | Int8Array
        | Uint8Array
        | Uint8ClampedArray
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | Float32Array
        | Float64Array
>(seperator: any, arr: T): T[] {
    const res: T[] = [];
    let start = 0;
    let nextIdx: number;
    do {
        nextIdx = arr.indexOf(seperator, start);
        if (nextIdx !== -1) {
            res.push(arr.slice(start, nextIdx + 1) as T);
            start = nextIdx + 1;
        } else {
            res.push(arr.slice(start, arr.length) as T);
        }
    } while (nextIdx !== -1 && nextIdx !== arr.length - 1);

    return res;
}

/**
 * Takes an object and formats it into a human-readable string JSON representation using line breaks and spaces
 *
 * @param jsonOrObject Either an object or a stringified json representation of an object, invalid json will lead to strange formattings
 */
export function objectToFormattedString(jsonOrObject: string | object): string {
    if (!jsonOrObject) {
        return undefined;
    }
    let json = JSON.stringify(
        JSON.parse(
            jsonOrObject && typeof jsonOrObject !== `string` ? JSON.stringify(jsonOrObject) : (jsonOrObject as string)
        )
    );

    // Extract strings from JSON
    const stringRegex = /\"([^\"]+)\"/g;
    const stringReplacement = `#`;
    let strings: string[] = [...json.match(stringRegex)];
    while (stringRegex.test(json)) {
        json = json.replace(stringRegex, stringReplacement);
    }

    // If the json actually represents an object or array, format the JSON skeleton
    json = formatJsonSkeleton(json);

    // Merge strings back with json skeleton
    let result = ``;
    let jsonArray = json.split(stringReplacement);
    while (jsonArray.length) {
        result = result + jsonArray[0] + (strings.length ? strings[0] : ``);
        jsonArray = jsonArray.slice(1);
        if (strings.length) {
            strings = strings.slice(1);
        }
    }
    return result;
}

function formatJsonSkeleton(json: string): string {
    const append = [`[`, `{`, `,`];
    const prepend = [`]`, `}`];
    for (let symbol of append) {
        json = splitStringKeepSeperator(json, symbol, `append`).join(`\n`);
    }
    for (let symbol of prepend) {
        json = splitStringKeepSeperator(json, symbol, `prepend`).join(`\n`);
    }
    json = json.split(`:`).join(`: `).trim();
    return addSpacersToMultiLineJson(json);
}

function addSpacersToMultiLineJson(json: string): string {
    const openers = [`[`, `{`];
    const closers = [`]`, `}`];
    const jsonArray = json.split(`\n`);
    let resultArray: string[] = [];
    let level = 0;
    for (let element of jsonArray) {
        if (openers.includes(element.charAt(element.length - 1))) {
            resultArray.push(getSpacer(level) + element);
            level++;
            continue;
        } else if (closers.includes(element.charAt(0)) && level > 0) {
            level--;
        }
        resultArray.push(getSpacer(level) + element);
    }
    return resultArray.filter(line => !!line.trim()).join(`\n`);
}

function getSpacer(level: number): string {
    let spacer = ``;
    for (let i = 0; i < level; i++) {
        spacer = spacer + `   `;
    }
    return spacer;
}

export function isValidId(id: number): boolean {
    return !Number.isNaN(id) || id > 0;
}

export interface ListUpdateData<T extends Identifiable> {
    toCreate?: Omit<T, `id`>[];
    toUpdate?: T[];
    toDelete?: Id[];
}

export function partitionModelsForUpdate<T extends Identifiable>(
    newValues: T[],
    originals: T[] = []
): ListUpdateData<T> {
    const originalIds = originals.map(value => value.id);
    const updatedIds = newValues.map(val => val.id).filter(id => !!id);
    const deleteSet = new Set<Id>(originalIds);
    updatedIds.forEach(id => deleteSet.delete(id));
    const toDelete = Array.from(deleteSet);
    const toUpdate: T[] = newValues.filter(update => {
        if (!update.id) {
            return false;
        }
        const former = originals.find(value => value.id === update.id);
        return Object.keys(update).some(key => key !== `id` && former[key] !== update[key]);
    });
    const toCreate: Omit<T, `id`>[] = newValues.filter(val => !val.id);
    return { toDelete, toUpdate, toCreate };
}

export type ObjectReplaceKeysConfig = [string, string][];

export function replaceObjectKeys(
    object: { [key: string]: any },
    config: ObjectReplaceKeysConfig,
    reverse?: boolean
): Object {
    if (reverse) {
        return replaceObjectKeys(
            object,
            config.map(line => [line[1], line[0]] as [string, string])
        );
    }
    const map = new Map<string, string>(config);
    let result: { [key: string]: any } = {};
    for (let key of Object.keys(object)) {
        const newKey = map.get(key) ?? key;
        result[newKey] = object[key];
    }
    return result;
}
