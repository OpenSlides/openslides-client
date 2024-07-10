import OriginalOrderedList from '@tiptap/extension-ordered-list';

export const OrderedList = OriginalOrderedList.extend({
    addAttributes() {
        return {
            ...this.parent,
            start: {
                default: null,
                parseHTML: (element): string => {
                    return element.getAttribute(`start`);
                }
            },
            type: {
                default: null,
                parseHTML: (element): string => {
                    return element.getAttribute(`type`);
                }
            }
        };
    }
});
