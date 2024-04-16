import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import tinycolor from 'tinycolor2';

export const ClearTextcolorPaste = Extension.create({
    addProseMirrorPlugins() {
        return [ClearTextcolorPastePlugin];
    }
});

const ClearTextcolorPastePlugin = new Plugin({
    props: {
        transformPastedHTML(html: string): string {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, `text/html`);
            const elements = doc.getElementsByTagName(`*`);
            for (let i = 0; i < elements.length; i++) {
                const el = <HTMLElement>elements.item(i);
                if (el.style && el.style.color && tinycolor(el.style.color).toHex() === `000000`) {
                    console.log(el.style.color);
                    el.style.color = ``;
                }
            }

            return doc.documentElement.outerHTML;
        }
    }
});
