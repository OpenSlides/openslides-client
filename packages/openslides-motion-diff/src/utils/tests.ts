export const brMarkup = (no: number): string => {
    return (
        `<br class="os-line-break">` +
        `<span class="line-number-${no} os-line-number" contenteditable="false" data-line-number="${no}">&nbsp;</span>`
    );
};

export const noMarkup = (no: number): string => {
    return (
        `<span class="line-number-${no} os-line-number" contenteditable="false" data-line-number="${no}">&nbsp;</span>`
    );
};

export const longstr = (length: number): string => {
    let outstr = ``;
    for (let i = 0; i < length; i++) {
        outstr += String.fromCharCode(65 + (i % 26));
    }
    return outstr;
};
