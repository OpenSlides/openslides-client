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
 * Removes the sourounding tag of a node
 *
 * @param {Node} node
 * @returns {Node}
 */
export function unwrapNode(node: Node): void {
    const parent = node.parentNode;
    while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
    }
    parent.removeChild(node);
}
