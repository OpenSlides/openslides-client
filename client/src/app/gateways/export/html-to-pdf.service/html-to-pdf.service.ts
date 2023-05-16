import { Injectable } from '@angular/core';
import { ExportServiceModule } from 'src/app/gateways/export';

export interface ChildNodeParagraphPayload {
    child: Element;
    parent: Element;
    styles?: string[];
}

export interface CreateSpecificParagraphPayload {
    element: Element;
    nodeName: string;
    classes: any[];
    styles: string[];
}

/**
 * Converts HTML strings to pdfmake compatible document definition.
 *
 * TODO: Bring back upstream to pdfmake, so other projects may benefit from this converter and
 *       to exclude complex code from OpenSlides.
 *       Everything OpenSlides specific, such as line numbering and change recommendations,
 *       should be excluded from this and handled elsewhere.
 *
 * @example
 * ```
 * const dd = htmlToPdfService.convertHtml('<h3>Hello World!</h3>');
 * ```
 */
@Injectable({
    providedIn: ExportServiceModule
})
export class HtmlToPdfService {
    /**
     * Normal line height for paragraphs
     */
    protected lineHeight = 1.25;

    /**
     * space between paragraphs
     */
    protected readonly P_MARGIN_BOTTOM = 4.0;

    /**
     * Space above H
     */
    protected readonly H_MARGIN_TOP = 10.0;

    /**
     * Conversion of HTML tags into pdfmake directives
     */
    private elementStyles: any = {
        // should be the same for most HTML code
        b: [`font-weight:bold`],
        strong: [`font-weight:bold`],
        u: [`text-decoration:underline`],
        em: [`font-style:italic`],
        i: [`font-style:italic`],
        h1: [`font-size:14`, `font-weight:bold`],
        h2: [`font-size:12`, `font-weight:bold`],
        h3: [`font-size:10`, `font-weight:bold`],
        h4: [`font-size:10`, `font-style:italic`],
        h5: [`font-size:10`],
        h6: [`font-size:10`],
        a: [`color:blue`, `text-decoration:underline`],
        strike: [`text-decoration:line-through`],
        // Pretty specific stuff that might be excluded for other projects than OpenSlides
        del: [`color:red`, `text-decoration:line-through`],
        ins: [`color:green`, `text-decoration:underline`]
    };

    /**
     * Treatment of required CSS-Classes
     * Checking CSS is not possible
     */
    private classStyles: any = {
        delete: [`color:red`, `text-decoration:line-through`],
        insert: [`color:green`, `text-decoration:underline`],
        paragraphcontext: [`color:grey`]
    };

    /**
     * Function to convert plain html text without linenumbering.
     *
     * @param text The html text that should be converted to PDF.
     *
     * @returns {object} The converted html as DocDef.
     */
    public addPlainText(text: string): object {
        return {
            columns: [{ stack: this.convertHtml({ htmlText: text }) }]
        };
    }

    /**
     * Takes an HTML string, converts to HTML using a DOM parser and recursivly parses
     * the content into pdfmake compatible doc definition
     *
     * @param htmlText the html text to translate as string
     * @returns pdfmake doc definition as object
     */
    public convertHtml({ htmlText }: { htmlText: string }): object {
        const docDef = [];

        // Create a HTML DOM tree out of html string
        const parser = new DOMParser();
        const parsedHtml = parser.parseFromString(htmlText, `text/html`);
        // Since the spread operator did not work for HTMLCollection, use Array.from
        const htmlArray = Array.from(parsedHtml.body.childNodes) as Element[];

        // Parse the children of the current HTML element
        for (const child of htmlArray) {
            const parsedElement = this.parseElement(child);
            docDef.push(parsedElement);
        }

        // DEBUG: printing the following. Do not remove, just comment out
        // console.log('MakePDF doc :\n---\n', JSON.stringify(docDef), '\n---\n');

        return docDef;
    }

    /**
     * Converts a single HTML element to pdfmake, calls itself recursively for child html elements
     *
     * @param element can be an HTML element (<p>) or plain text ("Hello World")
     * @param styles holds the style attributes of HTML elements (`<div style="color: green">...`)
     * @returns the doc def to the given element in consideration to the given paragraph and styles
     */
    public parseElement(element: Element, styles: string[] = []): any {
        const nodeName = element.nodeName.toLowerCase();
        let classes: any[] = [];
        let newParagraph: any;

        // extract explicit style information
        styles = styles || [];

        // to leave out plain text elements
        if (element.getAttribute) {
            const nodeStyle = element.getAttribute(`style`);
            const nodeClass = element.getAttribute(`class`);

            // add styles like `color:#ff00ff` content into styles array
            if (nodeStyle) {
                styles = nodeStyle
                    .split(`;`)
                    .map(style => style.replace(/\s/g, ``))
                    .concat(styles);
            }

            // Handle CSS classes
            if (nodeClass) {
                classes = nodeClass.toLowerCase().split(` `);

                for (const cssClass of classes) {
                    if (this.classStyles[cssClass]) {
                        this.classStyles[cssClass].forEach((style: any) => {
                            styles.push(style);
                        });
                    }
                }
            }
        }

        const createPayload = { element, nodeName, classes, styles };

        switch (nodeName) {
            case `h1`:
            case `h2`:
            case `h3`:
            case `h4`:
            case `h5`:
            case `h6`:
            case `li`:
            case `p`:
            case `div`: {
                newParagraph = this.createDivParagraph(createPayload);
                break;
            }
            case `a`:
                newParagraph = this.createHyperlinkParagraph(createPayload);
                break;
            case `b`:
            case `strong`:
            case `u`:
            case `em`:
            case `i`:
            case `ins`:
            case `del`:
            case `strike`: {
                newParagraph = this.createFormattedParagraph(createPayload);
                break;
            }
            case `span`: {
                newParagraph = this.createSpanParagraph(createPayload);
                break;
            }
            case `br`: {
                newParagraph = this.create(`text`);
                newParagraph.text = `\n`;
                newParagraph.lineHeight = this.lineHeight;
                break;
            }
            case `ul`:
            case `ol`: {
                newParagraph = this.createListParagraph(createPayload);
                break;
            }
            default: {
                newParagraph = this.createDefaultParagraph(createPayload);
                break;
            }
        }
        return newParagraph;
    }

    /**
     * Used by parseElement to create a paragraph corresponding to a div or a similar element.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createDivParagraph(data: CreateSpecificParagraphPayload): any {
        const children = this.parseChildren(data.element, data.styles);
        let newParagraph = this.create(`text`);
        newParagraph.text = children;
        newParagraph = this.formatDivParagraph(newParagraph, data);
        return newParagraph;
    }

    protected formatDivParagraph(paragraph: any, data: CreateSpecificParagraphPayload): any {
        const { element, nodeName, classes, styles } = data;
        paragraph.margin = [0, 0, 0, 0];

        // determine the "normal" top and button margins
        paragraph.margin[1] = this.getMarginTop(nodeName);
        paragraph.margin[3] = this.getMarginBottom(nodeName);

        paragraph.lineHeight = this.lineHeight;
        paragraph = {
            ...paragraph,
            ...this.computeStyle(styles),
            ...this.computeStyle(this.elementStyles[nodeName])
        };
        // if the ol list has specific list type
        if (nodeName === `li` && element.parentNode?.nodeName === `OL`) {
            const type = element.parentElement!.getAttribute(`type`);
            switch (type) {
                case `a`:
                    paragraph.listType = `lower-alpha`;
                    break;
                case `A`:
                    paragraph.listType = `upper-alpha`;
                    break;
                case `i`:
                    paragraph.listType = `lower-roman`;
                    break;
                case `I`:
                    paragraph.listType = `upper-roman`;
                    break;
                default:
                    break;
            }
        }
        return paragraph;
    }

    /**
     * Used by parseElement to create a paragraph corresponding to a formatted element.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createHyperlinkParagraph(data: CreateSpecificParagraphPayload): any {
        let newParagraph = this.createFormattedParagraph(data);

        const href = (<HTMLAnchorElement>data.element).href;
        if (href) {
            newParagraph = this.addPropertyToTexts(newParagraph, `link`, href);
        }

        return newParagraph;
    }

    /**
     * Used by parseElement to create a paragraph corresponding to a formatted element.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createFormattedParagraph(data: CreateSpecificParagraphPayload): any {
        const children = this.parseChildren(data.element, data.styles.concat(this.elementStyles[data.nodeName]));
        let newParagraph = this.create(`text`);
        newParagraph.text = children;
        return newParagraph;
    }

    /**
     * Used by parseElement to create a paragraph corresponding to a span or a similar element.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createSpanParagraph(data: CreateSpecificParagraphPayload): any {
        const children = this.parseChildren(data.element, data.styles);
        let newParagraph = {
            ...this.create(`text`),
            ...this.computeStyle(data.styles)
        };

        newParagraph.text = children;
        return newParagraph;
    }

    /**
     * Used by parseElement to create  a paragraph corresponding to a list.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createListParagraph(data: CreateSpecificParagraphPayload): any {
        let children = this.parseChildren(data.element, data.styles);
        const list = this.create(data.nodeName);

        // Fixes nested lists being placed inside `text` elements
        if (
            children.length === 1 &&
            (<any>children[0])?.text.length &&
            (<any>children[0])?.text.find((el: any) => !!el.ul)
        ) {
            // @ts-ignore
            children = [{ stack: (<any>children[0]).text }];
        }

        // keep the numbers of the ol list
        if (data.nodeName === `ol`) {
            const start = data.element.getAttribute(`start`);
            if (start) {
                list.start = parseInt(start, 10);
            }
        }
        let newParagraph = list;
        newParagraph[data.nodeName] = children;
        return newParagraph;
    }

    /**
     * Used by parseElement to create a paragraph corresponding to a type of element that was unaccounted for.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected createDefaultParagraph(data: CreateSpecificParagraphPayload): any {
        let newParagraph = {
            ...this.create(`text`, data.element.textContent!.replace(/\n/g, ``)),
            ...this.computeStyle(data.styles)
        };
        return newParagraph;
    }

    /**
     * Helper routine to parse an elements children and return the children as parsed pdfmake doc string
     *
     * @param element the parent element to parse
     * @param styles the styles array, usually just to parse back into the `parseElement` function
     * @returns an array of parsed children
     */
    protected parseChildren(element: Element, styles?: string[]): Element[] {
        const childNodes = Array.from(element.childNodes) as Element[];
        const paragraph: any[] = [];
        if (childNodes.length > 0) {
            for (const child of childNodes) {
                // skip empty child nodes
                if (!(child.nodeName === `#text` && child.textContent?.trim() === ``)) {
                    this.addChildNodeIntoParagraphs(paragraph, { child, parent: element, styles });
                }
            }
        }
        return paragraph;
    }

    /**
     * Takes a list of paragraphs and the data from which to calculate the next paragraph and appends the child node.
     * Can be overwritten by subclasses for more specific functionality.
     */
    protected addChildNodeIntoParagraphs(paragraph: any[], data: ChildNodeParagraphPayload) {
        const parsedElement = this.parseElement(data.child, data.styles);
        paragraph.push(parsedElement);
    }

    /**
     * Helper function to create valid doc definitions container elements for pdfmake
     *
     * @param name should be a pdfMake container element, like 'text' or 'stack'
     * @param content
     */
    protected create(name: string, content?: any): any {
        const container: any = {};
        const docDef = content ? content : [];
        container[name] = docDef;
        return container;
    }

    /**
     * Helper function to recursivly add a property to all text objects
     *
     * @param node A node containing a text property
     * @param propName
     * @param propValue
     */
    protected addPropertyToTexts(node: any, propName: string, propValue: any): object {
        if (node.text instanceof Array) {
            node.text = node.text.map((val: any) => this.addPropertyToTexts(val, propName, propValue));
            return node;
        } else if (node.text instanceof Object) {
            node.text = this.addPropertyToTexts(node.text, propName, propValue);
            return node;
        }

        node[propName] = propValue;
        return node;
    }

    /**
     * Determine the ideal top margin for a given node.
     * May be overwritten in subclasses.
     *
     * @param nodeName the node to parse
     * @returns the margin tip as number
     */
    protected getMarginTop(nodeName: string): number {
        if (nodeName.match(/^h[1-6]$/)) {
            return this.H_MARGIN_TOP;
        }
        return 0;
    }

    /**
     * Determine the ideal margin for a given node.
     * May be overwritten in subclasses.
     *
     * @param nodeName the node to parse
     * @returns the margin bottom as number
     */
    protected getMarginBottom(nodeName: string): number {
        return this.P_MARGIN_BOTTOM;
    }

    /**
     * Extracts the style information from the given array
     *
     * @param styles an array of inline css styles (i.e. `style="margin: 10px"`)
     * @returns an object with style pdfmake compatible style information
     */
    private computeStyle(styles: string[]): any {
        const styleObject: any = {};
        if (styles && styles.length > 0) {
            for (const style of styles) {
                const styleDefinition = style.trim().toLowerCase().split(`:`);
                const key = styleDefinition[0];
                const value = styleDefinition[1];

                if (styleDefinition.length === 2) {
                    switch (key) {
                        case `padding-left`: {
                            styleObject.margin = [parseInt(value, 10), 0, 0, 0];
                            break;
                        }
                        case `font-size`: {
                            styleObject.fontSize = parseInt(value, 10);
                            break;
                        }
                        case `text-align`: {
                            switch (value) {
                                case `right`:
                                case `center`:
                                case `justify`: {
                                    styleObject.alignment = value;
                                    break;
                                }
                            }
                            break;
                        }
                        case `font-weight`: {
                            switch (value) {
                                case `bold`: {
                                    styleObject.bold = true;
                                    break;
                                }
                            }
                            break;
                        }
                        case `text-decoration`: {
                            if (!styleObject.decoration) {
                                styleObject.decoration = [];
                            }
                            switch (value) {
                                case `underline`: {
                                    if (!styleObject.decoration.includes(`underline`)) {
                                        styleObject.decoration.push(`underline`);
                                    }
                                    break;
                                }
                                case `line-through`: {
                                    if (!styleObject.decoration.includes(`lineThrough`)) {
                                        styleObject.decoration.push(`lineThrough`);
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                        case `font-style`: {
                            switch (value) {
                                case `italic`: {
                                    styleObject.italics = true;
                                    break;
                                }
                            }
                            break;
                        }
                        case `color`: {
                            styleObject.color = this.parseColor(value);
                            break;
                        }
                        case `background-color`: {
                            styleObject.background = this.parseColor(value);
                            break;
                        }
                    }
                }
            }
        }
        return styleObject;
    }

    /**
     * Returns the color in a hex format (e.g. #12ff00).
     * Also tries to convert RGB colors into hex values
     *
     * @param color color as string representation
     * @returns color as hex values for pdfmake
     */
    private parseColor(color: string): string {
        const haxRegex = new RegExp(`^#([0-9a-f]{3}|[0-9a-f]{6})$`);

        // e.g. `#fff` or `#ff0048`
        const rgbRegex = new RegExp(`^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$`);

        // e.g. rgb(0,255,34) or rgb(22, 0, 0)
        const nameRegex = new RegExp(`^[a-z]+$`);

        if (haxRegex.test(color)) {
            return color;
        } else if (rgbRegex.test(color)) {
            const decimalColors = rgbRegex.exec(color)!.slice(1);
            for (let i = 0; i < 3; i++) {
                let decimalValue = parseInt(decimalColors[i], 10);
                if (decimalValue > 255) {
                    decimalValue = 255;
                }
                let hexString = `0` + decimalValue.toString(16);
                hexString = hexString.slice(-2);
                decimalColors[i] = hexString;
            }
            return `#` + decimalColors.join(``);
        } else if (nameRegex.test(color)) {
            return color;
        } else {
            console.error(`Could not parse color "` + color + `"`);
            return color;
        }
    }
}
