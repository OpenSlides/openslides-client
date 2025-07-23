export const brMarkup = (no: number): string => {
    return (
        `<br class="os-line-break">` +
        `<span contenteditable="false" class="os-line-number line-number-` +
        no +
        `" data-line-number="` +
        no +
        `">&nbsp;</span>`
    );
};
export const noMarkup = (no: number): string => {
    return (
        `<span contenteditable="false" class="os-line-number line-number-` +
        no +
        `" data-line-number="` +
        no +
        `">&nbsp;</span>`
    );
};
export const longstr = (length: number): string => {
    let outstr = ``;
    for (let i = 0; i < length; i++) {
        outstr += String.fromCharCode(65 + (i % 26));
    }
    return outstr;
};
