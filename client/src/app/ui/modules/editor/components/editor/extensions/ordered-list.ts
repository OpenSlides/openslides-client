import OriginalOrderedList from '@tiptap/extension-ordered-list';

export const OrderedList = OriginalOrderedList.extend({
    addAttributes() {
        return {
            ...this.parent,
            type: {
                default: null,
                parseHTML: element => {
                    return element.getAttribute(`type`);
                }
            }
        };
    }
});
