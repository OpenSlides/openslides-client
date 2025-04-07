import { Extension } from "@tiptap/core";

export const OsSplit = Extension.create({
    addGlobalAttributes() {
        return [{
            types: [`paragraph`, `orderedList`, `bulletList`, `listItem`],
            attributes: {
                class: {}
            }
        }];
    }
});
