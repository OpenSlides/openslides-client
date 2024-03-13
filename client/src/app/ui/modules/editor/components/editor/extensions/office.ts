import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const MSOfficePaste = Extension.create({
    priority: 99999,

    addProseMirrorPlugins() {
        return [OfficePastePlugin];
    }
});

const OfficePastePlugin = new Plugin({
    props: {
        transformPastedHTML(html: string) {
            console.log(html);
            if (html.indexOf(`microsoft-com`) !== -1 && html.indexOf(`office`) !== -1) {
                console.log(`Cleaning up`);
                html = transformLists(html);
                html = transformRemoveBookmarks(html);
                html = transformMsoStyles(html);
            }
            console.log(html);
            return html;
        }
    }
});

function transformMsoStyles(html: string): string {
    html = html.replace(/<o:p>(.*)<\/o:p>/g, ``);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, `text/html`);
    doc.querySelectorAll(`[style*="mso-"]`).forEach(node => {
        const styles = parseStyleAttribute(node.attributes[`style`]?.value || ``);
        const newStyles = [];
        for (const prop of Object.keys(styles)) {
            if (prop && !prop.startsWith(`mso-`)) {
                newStyles.push(`${prop}: ${styles[prop]}`);
            }
        }
        node.setAttribute(`style`, newStyles.join(`;`));
    });

    doc.querySelectorAll(`[style*="color: black"]`).forEach(node => {
        (node as HTMLElement).style.removeProperty(`color`);
    });

    return doc.documentElement.outerHTML;
}

function transformRemoveBookmarks(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, `text/html`);
    const bookmarks = doc.querySelectorAll(`[style*="mso-bookmark:"]`);
    bookmarks.forEach(node => {
        const bookmark = parseStyleAttribute(node.attributes[`style`]?.value || ``)[`mso-bookmark`];
        const bookmarkLink = doc.querySelector(`a[name="${bookmark}"]`);
        if (bookmarkLink) {
            bookmarkLink.parentNode.removeChild(bookmarkLink);
        }
        unwrap(node as HTMLElement);
    });

    return doc.documentElement.outerHTML;
}

function unwrap(el: HTMLElement): void {
    const parent = el.parentNode;
    while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
    }
    parent.removeChild(el);
}

function transformLists(html: string): string {
    if (html.indexOf(`mso-list:`) === -1) {
        return html;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, `text/html`);

    const lists: HTMLElement[] = [];
    let currentUl: HTMLElement;
    let currentListId: string;
    let elementBetween = false;
    doc.body.childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        // Check if the element is part of a list
        const el = <HTMLElement>node;
        const msoListValue: string = parseStyleAttribute(el.attributes[`style`]?.value || ``)[`mso-list`];
        if (!msoListValue) {
            elementBetween = true;
            return;
        }

        const msoListInfos = msoListValue.split(` `);
        const listLevel = +msoListInfos.find((e: string) => e.startsWith(`level`)).substring(5);
        const msoListId = msoListInfos.find(e => /l[0-9]+/.test(e));
        const classIdentified =
            el.classList.contains(`MsoListParagraph`) || el.classList.contains(`MsoListParagraphCxSpFirst`);
        if (classIdentified || (currentListId !== msoListId && (elementBetween || listLevel === 1))) {
            elementBetween = false;
            currentListId = msoListId;
            const listInfo = getListType(getListPrefix(el));
            currentUl = document.createElement(listInfo.type);
            if (listInfo.countType) {
                currentUl.setAttribute(`type`, listInfo.countType);
            }

            lists.push(currentUl);
            el.before(currentUl);
        }

        const prefix = getListPrefix(el);
        // Remove list item numbers
        el.innerHTML = el.innerHTML.replace(listTypeRegex, ``);

        // Get the mso list item level
        const li = document.createElement(`li`);
        li.innerHTML = el.innerHTML;

        // Add list level attribute if element needs to be moved to sublist
        if (listLevel && listLevel > 1) {
            li.dataset[`listLevel`] = `${listLevel - 1}`;
            if (prefix) {
                const listInfo = getListType(prefix);
                li.dataset[`listType`] = listInfo.type;
                li.dataset[`countType`] = listInfo.countType || ``;
            }
        }
        currentUl.appendChild(li);
        el.remove();
    });

    fixLists(lists);
    return doc.documentElement.outerHTML;
}

const listTypeRegex = /<!--\[if \!supportLists\]-->((.|\n)*)<!--\[endif\]-->/m;
function getListPrefix(el: HTMLElement) {
    const matches = el.innerHTML.match(listTypeRegex);
    if (matches?.length) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(matches[0], `text/html`);
        return doc.body.querySelector(`span`).textContent;
    }

    return ``;
}

function parseStyleAttribute(styleRaw: string): { [prop: string]: string } {
    return Object.fromEntries(styleRaw.split(`;`).map(line => line.split(`:`).map(v => v.trim())));
}

function getListType(prefix: string) {
    let type = `ul`;
    let countType: string | null = null;
    if (/[0-9]+\./.test(prefix)) {
        type = `ol`;
    } else if (/(?=[mdclxvi])m*(c[md]|d?c*)(x[cl]|l?x*)(i[xv]|v?i*)/.test(prefix)) {
        type = `ol`;
        countType = `i`;
    } else if (/(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)/.test(prefix)) {
        type = `ol`;
        countType = `I`;
    } else if (/[a-z]+\./.test(prefix)) {
        type = `ol`;
        countType = `a`;
    } else if (/[A-Z]+\./.test(prefix)) {
        type = `ol`;
        countType = `A`;
    }

    return {
        type,
        countType
    };
}

function fixLists(lists: HTMLElement[]) {
    const nextLists = [];
    for (const list of lists) {
        let node = list.childNodes[0];
        while (node) {
            if (node.nodeName !== `LI`) {
                node = node.nextSibling;
                continue;
            }

            const el = <HTMLElement>node;
            node = node.nextSibling;
            if (+el.dataset[`listLevel`]) {
                el.dataset[`listLevel`] = `${+el.dataset[`listLevel`] - 1}`;
                if (!el.previousElementSibling) {
                    return;
                }

                // Check if parent already has a sublist
                let sublist: HTMLElement = document.createElement(el.dataset[`listType`] || list.nodeName);
                if (el.previousElementSibling?.lastElementChild?.nodeName === list.nodeName) {
                    sublist = <HTMLElement>el.previousElementSibling.lastElementChild;
                } else {
                    if (el.dataset[`countType`]) {
                        sublist.setAttribute(`type`, el.dataset[`countType`]);
                    }
                    el.previousElementSibling.appendChild(sublist);
                    nextLists.push(sublist);
                }

                sublist.appendChild(el);
            }
        }
    }

    if (nextLists.length) {
        fixLists(nextLists);
    }
}
