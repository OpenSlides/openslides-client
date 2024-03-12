import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

export const MSOfficePaste = Extension.create({
    addProseMirrorPlugins() {
        return [OfficePastePlugin];
    }
});

const OfficePastePlugin = new Plugin({
    props: {
        transformPastedHTML(html: string) {
            if (html.indexOf(`mso-list:`) === -1) {
                return html;
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, `text/html`);

            const lists: HTMLElement[] = [];
            let currentUl: HTMLElement;
            let currentListId: string;
            doc.body.childNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                // Check if the element is part of a list
                const el = <HTMLElement>node;
                const msoListValue: string = parseStyleAttribute(el.attributes[`style`]?.value || ``)[`mso-list`];
                if (!msoListValue) {
                    return;
                }

                const msoListInfos = msoListValue.split(` `);
                const msoListId = msoListInfos.find(e => /l[0-9]+/.test(e));
                const classIdentified =
                    el.classList.contains(`MsoListParagraph`) || el.classList.contains(`MsoListParagraphCxSpFirst`);
                if (classIdentified || currentListId !== msoListId) {
                    currentListId = msoListId;
                    const listInfo = getListType(getListPrefix(el));
                    currentUl = document.createElement(listInfo.type);
                    if (listInfo.countType) {
                        currentUl.attributes[`type`] = listInfo.countType;
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

                const listLevel = +msoListInfos.find((e: string) => e.startsWith(`level`)).substring(5);

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
            console.log(html, doc.body.innerHTML);
            return doc.body.innerHTML;
        }
    }
});

const listTypeRegex = /<!--\[if \!supportLists\]-->((.|\n)*)<!--\[endif\]-->/m;
function getListPrefix(el: HTMLElement) {
    const matches = el.innerHTML.match(listTypeRegex);
    if (matches?.length) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(matches[0], `text/html`);
        return doc.textContent;
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
        // list.childNodes.forEach((node: Element) => {
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
