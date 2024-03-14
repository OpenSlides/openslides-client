/**
 * Replaces encoded HTML characters except &gt; and &lt;
 */
export function replaceHtmlEntities(html: string): string {
    html = html.replace(/&gt;/g, `<GT></GT>`);
    html = html.replace(/&lt;/g, `<LT></LT>`);
    html = html.replace(/&nbsp;/g, ` `);
    html = html.replace(/&ndash;/g, `-`);

    const textarea = document.createElement(`textarea`);
    textarea.innerHTML = html;
    html = textarea.value;

    html = html.replace(/<GT><\/GT>/g, `&gt;`);
    html = html.replace(/<LT><\/LT>/g, `&lt;`);

    return html;
}

/**
 * This searches for a given node name within the given node.
 * If the node is found the first or last occurence is returned.
 * If none is found, `null` is returned.
 *
 * @param {Node} node
 * @param {string} searchName
 * @param {boolean} last If true returns the last occurrence instead of the first
 * @returns {Element | null}
 */
export function getNodeByName(node: Node, searchName: string, last = false): Element | null {
    if (node.nodeType === Node.TEXT_NODE) {
        return null;
    }

    const element = <Element>node;
    if (element.nodeName.toUpperCase() === searchName.toUpperCase()) {
        return element;
    }

    const found = element.querySelectorAll(searchName);
    if (found.length > 0) {
        return found.item(last ? found.length - 1 : 0);
    }

    return null;
}

/**
 * Given a node, this method returns an array containing all parent elements of this node, recursively.
 *
 * @param {Node} node
 * @returns {Node[]}
 */
export function getNodeContextTrace(node: Node): Node[] {
    if (node) {
        const context = [node];
        while (context[0].parentNode) {
            context.unshift(context[0].parentNode);
        }

        return context;
    }

    return [];
}

/**
 * This method checks if the given `child`-Node is the first non-empty child element of the given parent Node
 * called `node`. Hence the name of this method.
 *
 * @param node
 * @param child
 */
export function isFirstNonemptyChild(node: Node, child: Node): boolean {
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i] === child) {
            return true;
        }

        if (node.childNodes[i].nodeType !== Node.TEXT_NODE || node.childNodes[i].nodeValue?.match(/\S/)) {
            return false;
        }
    }

    return false;
}

/**
 * An list element has a number of child LI nodes. Given a `descendantNode` that might be anywhere within
 * the hierarchy of the list, this method returns the index (starting with 1) of the LI element
 * that contains this node.
 *
 * @param listNode
 * @param descendantNode
 */
export function getNthOfListItem(listNode: Element, descendantNode: Node): number | null {
    // TODO: Improve this
    let nthLIOfOL = null;
    while (descendantNode.parentNode) {
        if (descendantNode.parentNode === listNode) {
            let lisBeforeOl = 0;
            let foundMe = false;
            for (let i = 0; i < listNode.childNodes.length && !foundMe; i++) {
                if (listNode.childNodes[i] === descendantNode) {
                    foundMe = true;
                } else if (listNode.childNodes[i].nodeName === `LI`) {
                    lisBeforeOl++;
                }
            }
            nthLIOfOL = lisBeforeOl + 1;
        }
        descendantNode = descendantNode.parentNode;
    }
    return nthLIOfOL;
}

/**
 * This converts the given HTML string into a DOM tree contained by a DocumentFragment, which is returned.
 *
 * @param {string} html
 * @return {DocumentFragment}
 */
export function htmlToFragment(html: string): DocumentFragment {
    const template = document.createElement(`template`);
    template.innerHTML = html;
    return template.content;
}

/**
 * Converts a HTML Document Fragment into HTML string, using the browser's internal mechanisms.
 * HINT: special characters might get escaped / html-encoded in the process of this.
 *
 * @param {DocumentFragment} fragment
 * @returns string
 */
export function fragmentToHtml(fragment: DocumentFragment): string {
    const div: Element = document.createElement(`DIV`);
    while (fragment.firstChild) {
        const child = fragment.firstChild;
        fragment.removeChild(child);
        div.appendChild(child);
    }
    return div.innerHTML;
}

/**
 * This converts an array of HTML elements into a string
 */
export function nodesToHtml(nodes: Element[]): string {
    const root = document.createElement(`div`);
    nodes?.forEach(node => {
        root.appendChild(node);
    });
    return root.innerHTML;
}

/**
 * Get all the siblings of the given node _after_ this node, in the order as they appear in the DOM tree.
 *
 * @param {Node} node
 * @returns {Node[]}
 */
export function getAllNextSiblings(node: Node): Node[] {
    const nodes: Node[] = [];
    while (node.nextSibling) {
        nodes.push(node.nextSibling);
        node = node.nextSibling;
    }
    return nodes;
}

/**
 * Get all the siblings of the given node _before_ this node,
 * with the one closest to the given node first (=> reversed order in regard to the DOM tree order)
 *
 * @param {Node} node
 * @returns {Node[]}
 */
export function getAllPrevSiblingsReversed(node: Node): Node[] {
    const nodes = [];
    while (node.previousSibling) {
        nodes.push(node.previousSibling);
        node = node.previousSibling;
    }
    return nodes;
}

/**
 * Traverses up the DOM tree until it finds a node with a nextSibling, then returns that sibling
 *
 * @param {Node} node
 * @returns {Node}
 */
export function findNextAuntNode(node: Node): Node | null {
    if (node.nextSibling) {
        return node.nextSibling;
    } else if (node.parentNode) {
        return findNextAuntNode(node.parentNode);
    }

    return null;
}

export function unwrapNode(el: Node): void {
    const parent = el.parentNode;
    while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
}

/**
 * This method adds a CSS class name to a given node.
 *
 * @param {Node} node
 * @param {string} className
 */
export function addCSSClass(node: Node, className: string): void {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const element = <HTMLElement>node;
    element.classList.add(className);
}

/**
 * This method removes a CSS class name from a given node.
 *
 * @param {Node} node
 * @param {string} className
 */
export function removeCSSClass(node: Node, className: string): void {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const element = <HTMLElement>node;
    element.classList.remove(className);

    if (!element.getAttribute(`class`)) {
        element.removeAttribute(`class`);
    }
}

/**
 * This checks if this string is valid inline HTML.
 * It does so by leveraging the browser's auto-correction mechanism and count the number of "<"s (opening and closing
 * HTML tags) of the original and the cleaned-up string.
 * This is mainly helpful to decide if a given string can be put into <del>...</del> or <ins>...</ins>-Tags without
 * producing broken HTML.
 *
 * @param {string} html
 * @return {boolean}
 */
export function isValidInlineHtml(html: string): boolean {
    // If there are no HTML tags, we assume it's valid and skip further checks
    if (!html.match(/<[^>]*>/)) {
        return true;
    }

    // We check if this is a valid HTML that closes all its tags again using the innerHTML-Hack to correct
    // the string and check if the number of HTML tags changes by this
    const doc = document.createElement(`div`);
    doc.innerHTML = html;
    const tagsBefore = (html.match(/</g) || []).length;
    const tagsCorrected = (doc.innerHTML.match(/</g) || []).length;
    if (tagsBefore !== tagsCorrected) {
        // The HTML has changed => it was not valid
        return false;
    }

    // If there is any block element inside, we consider it as broken, as this string will be displayed
    // inside of <ins>/<del> tags
    if (html.match(/<(div|p|ul|li|blockquote)\W/i)) {
        return false;
    }

    return true;
}

/**
 * Adds a CSS class to the first opening HTML tag within the given string.
 *
 * @param {string} html
 * @param {string} className
 * @returns {string}
 */
export function addCSSClassToFirstTag(html: string, className: string): string {
    return html.replace(/<[a-z][^>]*>/i, (match: string): string => {
        if (match.match(/class=["'][a-z0-9 _-]*["']/i)) {
            return match.replace(
                /class=["']([a-z0-9 _-]*)["']/i,
                (_match2: string, previousClasses: string): string =>
                    `class="` + previousClasses + ` ` + className + `"`
            );
        } else {
            return match.substring(0, match.length - 1) + ` class="` + className + `">`;
        }
    });
}

/**
 * Adds a CSS class to the last opening HTML tag within the given string.
 *
 * @param {string} html
 * @param {string} className
 * @returns {string}
 */
export function addClassToLastNode(html: string, className: string): string {
    const node = document.createElement(`div`);
    node.innerHTML = html;
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
        if (node.childNodes[i].nodeType === Node.ELEMENT_NODE) {
            const childElement = <HTMLElement>node.childNodes[i];
            childElement.classList.add(className);

            return node.innerHTML;
        }
    }
    return node.innerHTML;
}

/**
 * Add the CSS-class to the existing "class"-attribute, or add one.
 * Works on strings, not nodes
 *
 * @param {string} tagStr
 * @param {string} className
 * @returns {string}
 */
export function addClassToHtmlTag(tagStr: string, className: string): string {
    return tagStr.replace(/<(\w+)( [^>]*)?>/gi, (_whole: string, tag: string, tagArguments: string): string => {
        tagArguments = tagArguments ? tagArguments : ``;
        if (tagArguments.match(/class="/gi)) {
            // class="someclass" => class="someclass insert"
            tagArguments = tagArguments.replace(
                /(class\s*=\s*)(["'])([^\2]*)\2/gi,
                (_classWhole: string, attr: string, para: string, content: string): string =>
                    attr + para + content + ` ` + className + para
            );
        } else {
            tagArguments += ` class="` + className + `"`;
        }
        return `<` + tag + tagArguments + `>`;
    });
}

/**
 * This converts a HTML Node element into a rendered HTML string.
 *
 * @param {Node} node
 * @returns {string}
 * @throws {Error}
 */
export function serializeTag(node: Node): string {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        throw new Error(`Invalid node type`);
    }

    const element = <Element>node;
    let html = `<` + element.nodeName;
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        html += ` ` + attr.name + `="` + attr.value + `"`;
    }
    html += `>`;
    return html;
}

/**
 * Sorts element attributes and CSS class names of a given html string
 * alphabetically
 */
export function sortHtmlAttributes(html: string): string {
    return html.replace(/<(\/?[a-z]*)( [^>]*)?>/gi, (_fullHtml: string, tag: string, attributes: string): string => {
        if (attributes === undefined) {
            attributes = ``;
        }

        const attributesList = [];
        const attributesMatcher = /( [^"'=]*)(= *((["'])(.*?)\4))?/gi;
        let match = attributesMatcher.exec(attributes);
        while (match) {
            let attr = match[1];
            let attrValue = match[5];
            if (match[2] !== undefined) {
                if (match[1].toUpperCase() === ` CLASS`) {
                    attrValue = attrValue.split(` `).sort().join(` `);
                }
                attr += `=` + match[4] + attrValue + match[4];
            }

            if (attrValue !== ``) {
                attributesList.push(attr);
            }

            match = attributesMatcher.exec(attributes);
        }

        attributes = attributesList.sort().join(``);
        return `<` + tag + attributes + `>`;
    });
}

/**
 * Convert all HTML tags and attribute names to uppercase,
 * but leave the values of attributes unchanged
 */
export function htmlToUppercase(html: string): string {
    return html.replace(/<(\/?[a-z]*)( [^>]*)?>/gi, (_fullHtml: string, tag: string, attributes: string): string => {
        if (attributes === undefined) {
            attributes = ``;
        }

        attributes = attributes.replace(
            /( [^"'=]*)(= *(["']).*?\3)?/gi,
            (_fullHtml: string, attr: string, content: string, _quotes: string) => {
                return attr.toUpperCase() + (content ?? ``);
            }
        );

        return `<` + tag.toUpperCase() + attributes + `>`;
    });
}

/**
 * Returns true, if the provided element is an inline element (hard-coded list of known elements).
 *
 * @param {Element} element
 * @returns {boolean}
 */
export function isInlineElement(element: Element): boolean {
    const inlineElements = [
        `SPAN`,
        `A`,
        `EM`,
        `S`,
        `B`,
        `I`,
        `STRONG`,
        `U`,
        `BIG`,
        `SMALL`,
        `SUB`,
        `SUP`,
        `TT`,
        `INS`,
        `DEL`,
        `STRIKE`,
        `MARK`
    ];
    if (element) {
        return inlineElements.indexOf(element.nodeName) > -1;
    }

    return false;
}
