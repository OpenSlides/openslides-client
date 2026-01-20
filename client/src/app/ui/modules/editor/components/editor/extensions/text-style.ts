import { TextStyle as OriginalTextStyle } from '@tiptap/extension-text-style';

export const TextStyle = OriginalTextStyle.extend({
    parseHTML() {
        return this.parent?.().map(rule => {
            if (rule.tag === `span`) {
                const oldGetAttrs = rule.getAttrs;
                rule.getAttrs = (element: HTMLElement & string): any => {
                    if (!oldGetAttrs(element)) {
                        return false;
                    }

                    if (
                        element.style?.color ||
                        element.style?.fontSize ||
                        element.style?.backgroundColor ||
                        element.style?.lineHeight
                    ) {
                        return {};
                    }

                    return false;
                };
            }

            return rule;
        });
    }
});
