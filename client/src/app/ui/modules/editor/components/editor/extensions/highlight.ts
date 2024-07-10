import OriginalHighlight from '@tiptap/extension-highlight';

export const Highlight = OriginalHighlight.extend({
    parseHTML() {
        return [
            ...this.parent(),
            {
                tag: `span`,
                getAttrs: (node): false | Attr => !!(node as HTMLElement).style?.backgroundColor && null
            }
        ];
    }
});
