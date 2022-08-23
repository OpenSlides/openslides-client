/**
 *
 */
export function replaceHtmlEntities(html: string): string {
    const entities: any = {
        '&nbsp;': ` `,
        '&ndash;': `-`,
        '&auml;': `ä`,
        '&ouml;': `ö`,
        '&uuml;': `ü`,
        '&Auml;': `Ä`,
        '&Ouml;': `Ö`,
        '&Uuml;': `Ü`,
        '&szlig;': `ß`,
        '&bdquo;': `„`,
        '&ldquo;': `“`,
        '&bull;': `•`,
        '&sect;': `§`,
        '&eacute;': `é`,
        '&rsquo;': `’`,
        '&euro;': `€`,
        '&reg;': `®`,
        '&trade;': `™`,
        '&raquo;': `»`,
        '&laquo;': `«`,
        '&Acirc;': `Â`,
        '&acirc;': `â`,
        '&Ccedil;': `Ç`,
        '&ccedil;': `ç`,
        '&Egrave;': `È`,
        '&egrave;': `è`,
        '&Ntilde;': `Ñ`,
        '&ntilde;': `ñ`,
        '&Euml;': `Ë`,
        '&euml;': `ë`,
        '&Prime;': `″`,
        '&rdquo;': `”`
    };

    Object.keys(entities).forEach(ent => {
        html = html.replace(new RegExp(ent, `g`), entities[ent]);
    });

    return html;
}
