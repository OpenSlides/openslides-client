import { normalizeHtmlForDiff } from "./internal";

/**
 * Given two strings, this method generates a consolidated new string that indicates the operations necessary
 * to get from `oldStr` to `newStr` by <ins>...</ins> and <del>...</del>-Tags
 *
 * @param {string} oldStr
 * @param {string} newStr
 * @returns {string}
 */
export function diffString(oldStr: string, newStr: string): string {
    oldStr = normalizeHtmlForDiff(oldStr.replace(/\s+$/, ``).replace(/^\s+/, ``));
    newStr = normalizeHtmlForDiff(newStr.replace(/\s+$/, ``).replace(/^\s+/, ``));

    const out = diffArrays(tokenizeHtml(oldStr), tokenizeHtml(newStr));

    let str = ``;
    if (out.n.length === 0) {
        for (const o of out.o) {
            str += `<del>` + o + `</del>`;
        }
    } else {
        if (out.n[0].text === undefined) {
            for (let k = 0; k < out.o.length && out.o[k].text === undefined; k++) {
                str += `<del>` + out.o[k] + `</del>`;
            }
        }

        let currOldRow = 0;
        for (let i = 0; i < out.n.length; i++) {
            if (out.n[i].text === undefined) {
                if (out.n[i] !== ``) {
                    str += `<ins>` + out.n[i] + `</ins>`;
                }
            } else if (out.n[i].row < currOldRow) {
                str += `<ins>` + out.n[i].text + `</ins>`;
            } else {
                let pre = ``;

                if (i + 1 < out.n.length && out.n[i + 1].row !== undefined && out.n[i + 1].row > out.n[i].row + 1) {
                    for (let n = out.n[i].row + 1; n < out.n[i + 1].row; n++) {
                        if (out.o[n].text === undefined) {
                            pre += `<del>` + out.o[n] + `</del>`;
                        } else {
                            pre += `<del>` + out.o[n].text + `</del>`;
                        }
                    }
                } else {
                    for (let j = out.n[i].row + 1; j < out.o.length && out.o[j].text === undefined; j++) {
                        pre += `<del>` + out.o[j] + `</del>`;
                    }
                }
                str += out.n[i].text + pre;

                currOldRow = out.n[i].row;
            }
        }
    }

    return str.replace(/^\s+/g, ``).replace(/\s+$/g, ``).replace(/ {2,}/g, ` `);
}

/**
 * Adapted from http://ejohn.org/projects/javascript-diff-algorithm/
 * by John Resig, MIT License
 *
 * @param {array} oldArr
 * @param {array} newArr
 * @returns {object}
 */
function diffArrays(oldArr: any, newArr: any): any {
    const ns: any = {};
    const os: any = {};

    for (let i = 0; i < newArr.length; i++) {
        if (ns[newArr[i]] === undefined) {
            ns[newArr[i]] = { rows: [], o: null };
        }
        ns[newArr[i]].rows.push(i);
    }

    for (let i = 0; i < oldArr.length; i++) {
        if (os[oldArr[i]] === undefined) {
            os[oldArr[i]] = { rows: [], n: null };
        }
        os[oldArr[i]].rows.push(i);
    }

    for (const i in ns) {
        if (ns[i].rows.length === 1 && typeof os[i] !== `undefined` && os[i].rows.length === 1) {
            newArr[ns[i].rows[0]] = { text: newArr[ns[i].rows[0]], row: os[i].rows[0] };
            oldArr[os[i].rows[0]] = { text: oldArr[os[i].rows[0]], row: ns[i].rows[0] };
        } else if (
            ns[i].rows.length >= 1 &&
            ns[i].rows.indexOf(0) !== -1 &&
            os[i] !== undefined &&
            os[i].rows.indexOf(0) !== -1
        ) {
            newArr[0] = { text: newArr[0], row: 0 };
            oldArr[0] = { text: oldArr[0], row: 0 };
        }
    }

    for (let i = 0; i < newArr.length - 1; i++) {
        if (
            newArr[i].text !== null &&
            newArr[i + 1].text === undefined &&
            newArr[i].row + 1 < oldArr.length &&
            oldArr[newArr[i].row + 1].text === undefined &&
            newArr[i + 1] === oldArr[newArr[i].row + 1]
        ) {
            newArr[i + 1] = { text: newArr[i + 1], row: newArr[i].row + 1 };
            oldArr[newArr[i].row + 1] = { text: oldArr[newArr[i].row + 1], row: i + 1 };
        }
    }

    for (let i = newArr.length - 1; i > 0; i--) {
        if (
            newArr[i].text !== null &&
            newArr[i - 1].text === undefined &&
            newArr[i].row > 0 &&
            oldArr[newArr[i].row - 1].text === undefined &&
            newArr[i - 1] === oldArr[newArr[i].row - 1]
        ) {
            newArr[i - 1] = { text: newArr[i - 1], row: newArr[i].row - 1 };
            oldArr[newArr[i].row - 1] = { text: oldArr[newArr[i].row - 1], row: i - 1 };
        }
    }

    // This fixes the problem tested by "does not lose words when changes are moved X-wise"
    let lastRow = 0;
    for (let z = 0; z < newArr.length; z++) {
        if (newArr[z].row && newArr[z].row > lastRow) {
            lastRow = newArr[z].row;
        }
        if (newArr[z].row && newArr[z].row < lastRow) {
            oldArr[newArr[z].row] = oldArr[newArr[z].row].text;
            newArr[z] = newArr[z].text;
        }
    }

    return { o: oldArr, n: newArr };
}

const TOKENIZE_REGEXES = {
    prependLt: /(?=<)/g,
    appendGt: /(.*?>)/g,
    space: /( )/g,
    dot: /(\.)/g,
    comma: /(,)/g,
    exclaim: /(!)/g,
    dash: /(-)/g,
    appendNewline: /(.*?\n)/g,
};

/**
 * This method splits a string into an array of strings, such as that it can be used by the diff method.
 * Mainly it tries to split it into single words, but prevents HTML tags from being split into different elements.
 *
 * @param {string} str
 * @returns {string[]}
 */
function tokenizeHtml(str: string): string[] {
    const splitConfigs = [
        { by: `<`, regex: TOKENIZE_REGEXES.prependLt, append: false },
        { by: `>`, regex: TOKENIZE_REGEXES.appendGt, append: true },
        { by: ` `, regex: TOKENIZE_REGEXES.space, append: false },
        { by: `.`, regex: TOKENIZE_REGEXES.dot, append: false },
        { by: `,`, regex: TOKENIZE_REGEXES.comma, append: false },
        { by: `!`, regex: TOKENIZE_REGEXES.exclaim, append: false },
        { by: `-`, regex: TOKENIZE_REGEXES.dash, append: false },
        { by: `\n`, regex: TOKENIZE_REGEXES.appendNewline, append: true },
    ];

    let res = [str];
    for (const splitConf of splitConfigs) {
        const newArr = [];
        for (const str of res) {
            // Don't split HTML tags
            if (str[0] === `<` && splitConf.by !== `<` && splitConf.by !== `>`) {
                newArr.push(str);
                continue;
            }

            const parts = str.split(splitConf.regex);
            newArr.push(
                ...(splitConf.append ? parts.filter((el) => el !== ``) : parts),
            );
        }
        res = newArr;
    }

    return res.filter((el) => el !== ``);
}
