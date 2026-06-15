import { ELEMENT_NODE, TEXT_NODE } from "../utils/definitions";
import { addCSSClass, isValidInlineHtml } from "../utils/dom-helpers";
import { serializeDom } from "./internal";

/**
 * This fixes a very specific, really weird bug that is tested in the test case "does not a change in a very
 * specific case.
 *
 * @param {string}diffStr
 * @return {string}
 */
export function fixWrongChangeDetection(diffStr: string): string {
    if (diffStr.indexOf(`<del>`) === -1 || diffStr.indexOf(`<ins>`) === -1) {
        return diffStr;
    }

    const findDelGroupFinder = /(?:<del>.*?<\/del>)+/gi;
    let found: RegExpExecArray | null;
    let returnStr = diffStr;

    while ((found = findDelGroupFinder.exec(diffStr))) {
        const del = found[0];
        const split = returnStr.split(del);

        const findsGroupFinder = /^(?:<ins>.*?<\/ins>)+/gi;
        const foundIns = findsGroupFinder.exec(split[1]);
        if (foundIns) {
            const ins = foundIns[0];

            let delShortened = del
                .replace(
                    /<del>((<BR CLASS="os-line-break"><\/del><del>)?(<span[^>]+os-line-number[^>]+?>)(\s|<\/?del>)*<\/span>)<\/del>/gi,
                    ``
                )
                .replace(/<\/del><del>/g, ``);
            const insConv = ins
                .replace(/<ins>/g, `<del>`)
                .replace(/<\/ins>/g, `</del>`)
                .replace(/<\/del><del>/g, ``);
            if (delShortened.indexOf(insConv) !== -1) {
                delShortened = delShortened.replace(insConv, ``);
                if (delShortened === ``) {
                    returnStr = returnStr.replace(del + ins, del.replace(/<del>/g, ``).replace(/<\/del>/g, ``));
                }
            }
        }
    }
    return returnStr;
}

/**
 * This detects if a given string contains broken HTML. This can happen when the Diff accidentally produces
 * wrongly nested HTML tags.
 *
 * @param {string} html
 * @returns {boolean}
 * @private
 */
export function diffDetectBrokenDiffHtml(html: string): boolean {
    // If other HTML tags are contained within INS/DEL (e.g. "<ins>Test</p></ins>"), let's better be cautious
    // The "!!(found=...)"-construction is only used to make jshint happy :)
    const findDel = /<del>([\s\S]*?)<\/del>/gi;
    const findIns = /<ins>([\s\S]*?)<\/ins>/gi;
    let found: RegExpExecArray | null;
    let inner: string;
    while ((found = findDel.exec(html))) {
        inner = found[1].replace(/<br[^>]*>/gi, ``);
        if (!isValidInlineHtml(inner)) {
            return true;
        }
    }
    while ((found = findIns.exec(html))) {
        inner = found[1].replace(/<br[^>]*>/gi, ``);
        if (!isValidInlineHtml(inner)) {
            return true;
        }
    }

    // If non of the conditions up to now is met, we consider the diff as being sane
    return false;
}

/**
 * If the inline diff does not work, we fall back to showing the diff on a paragraph base, i.e. deleting the old
 * paragraph (adding the "deleted"-class) and adding the new one (adding the "added" class).
 * If the provided Text is not wrapped in HTML elements but inline text, the returned text is using
 * <ins>/<del>-tags instead of adding CSS-classes to the wrapping element.
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {string}
 */
export function diffParagraphs(oldText: string, newText: string): string {
    let oldTextWithBreaks: Element = document.createElement(`div`);
    let currChild: Element;

    oldTextWithBreaks.innerHTML = oldText;
    newText = newText.replace(/^\s+/g, ``).replace(/\s+$/g, ``);
    const newTextWithBreaks = document.createElement(`div`);
    newTextWithBreaks.innerHTML = newText;

    for (const child of oldTextWithBreaks.childNodes) {
        currChild = child as Element;
        if (currChild.nodeType === TEXT_NODE) {
            const wrapDel = document.createElement(`del`);
            oldTextWithBreaks.insertBefore(wrapDel, currChild);
            oldTextWithBreaks.removeChild(currChild);
            wrapDel.appendChild(currChild);
        } else {
            addCSSClass(currChild, `delete`);
            removeColorStyles(currChild);
        }
    }
    for (const child of newTextWithBreaks.childNodes) {
        currChild = child as Element;
        if (currChild.nodeType === TEXT_NODE) {
            const wrapIns = document.createElement(`ins`);
            newTextWithBreaks.insertBefore(wrapIns, currChild);
            newTextWithBreaks.removeChild(currChild);
            wrapIns.appendChild(currChild);
        } else {
            addCSSClass(currChild, `insert`);
            removeColorStyles(currChild);
        }
    }

    const mergedFragment = document.createDocumentFragment();
    let el: ChildNode | null;
    while ((el = oldTextWithBreaks.firstChild)) {
        oldTextWithBreaks.removeChild(el);
        mergedFragment.appendChild(el);
    }
    while ((el = newTextWithBreaks.firstChild)) {
        newTextWithBreaks.removeChild(el);
        mergedFragment.appendChild(el);
    }

    return serializeDom(mergedFragment, false);
}

/**
 * This function removes color-Attributes from the styles of this node or a descendant,
 * as they interfer with the green/red color in HTML and PDF
 *
 * For the moment, it is sufficient to do this only in paragraph diff mode, as we fall back to this mode anyway
 * once we encounter SPANs or other tags inside of INS/DEL-tags
 *
 * @param {Element} node
 * @private
 */
function removeColorStyles(node: Element): void {
    const styles = node.getAttribute(`style`);
    if (styles && styles.indexOf(`color`) > -1) {
        const stylesNew: any[] = [];
        styles.split(`;`).forEach((style: string): void => {
            if (!style.match(/^\s*color\s*:/i)) {
                stylesNew.push(style);
            }
        });
        if (stylesNew.join(`;`) === ``) {
            node.removeAttribute(`style`);
        } else {
            node.setAttribute(`style`, stylesNew.join(`;`));
        }
    }
    for (const child of node.childNodes) {
        if (child.nodeType === ELEMENT_NODE) {
            removeColorStyles((child as Element));
        }
    }
}
