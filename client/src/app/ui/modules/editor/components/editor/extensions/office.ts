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
            if (html.indexOf(`MsoListParagraph`) === -1) {
                return html;
            }

            const doc = document.createElement(`div`);
            doc.innerHTML = html;

            const lists: HTMLElement[] = [];
            let currentUl: HTMLElement;
            doc.childNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                // Check if the element is part of a list
                const el = <HTMLElement>node;
                if (el.className.indexOf(`MsoListParagraph`) === -1) {
                    return;
                }

                if (el.classList.contains(`MsoListParagraph`) || el.classList.contains(`MsoListParagraphCxSpFirst`)) {
                    const listInfo = getListType(el.firstElementChild.textContent);
                    currentUl = document.createElement(listInfo.type);
                    if (listInfo.countType) {
                        currentUl.attributes[`type`] = listInfo.countType;
                    }

                    lists.push(currentUl);
                    el.before(currentUl);
                }

                const prefix = el.firstElementChild.textContent;
                // Remove list item numbers
                if (el.firstElementChild.nodeName === `SPAN`) {
                    el.firstElementChild.remove();
                }

                // Get the mso list item level
                const li = document.createElement(`li`);
                li.innerHTML = el.innerHTML;
                const msoListValue: string = el.attributes[`style`].value
                    .split(`;`)
                    .find((style: string) => style.split(`:`)[0] === `mso-list`)
                    .split(`:`)[1];

                const listLevel = +msoListValue
                    .split(` `)
                    .find((e: string) => e.startsWith(`level`))
                    .substring(5);

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
            console.log(html, doc.innerHTML);
            return doc.innerHTML;
        }
    }
});

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
                        console.log(el.dataset[`countType`]);
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
