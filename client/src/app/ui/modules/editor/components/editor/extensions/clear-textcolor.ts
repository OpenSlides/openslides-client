import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { unwrapNode } from 'src/app/infrastructure/utils/dom-helpers';
import tinycolor from 'tinycolor2';

export const ClearTextcolorPaste = Extension.create({
    name: `clear-textcolor-paste`,
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
                const el = elements.item(i) as HTMLElement;
                if (!el.style) {
                    continue;
                }

                const textColor = !el.style.color || tinycolor(el.style.color).toHex();
                const bgColor = !el.style.backgroundColor || tinycolor(el.style.backgroundColor).toHex();

                if (
                    (textColor === `000000` && bgColor === `ffffff`) ||
                    (textColor === `ffffff` && bgColor === `424242`)
                ) {
                    el.style.color = ``;
                    el.style.backgroundColor = ``;
                }

                const styleAttribute = el.attributes.getNamedItem('style');
                if (!styleAttribute || styleAttribute.value === ``) {
                    unwrapNode(el);
                }
            }

            return doc.documentElement.outerHTML;
        }
    }
});
