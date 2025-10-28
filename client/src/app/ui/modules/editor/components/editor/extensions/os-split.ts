import { CommandProps, Extension } from '@tiptap/core';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import { NodeType } from '@tiptap/pm/model';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        osSplit: {
            /**
             * Add an iframe
             */
            osSplitLift: (typeOrName: string | NodeType) => ReturnType;
        };
    }
}

/**
 * The following extensions prevent users from lowering list levels
 * below the os-split-* parent lists.
 */
export const OsSplit = Extension.create({
    addGlobalAttributes() {
        return [
            {
                types: [`paragraph`, `orderedList`, `bulletList`, `listItem`],
                attributes: {
                    class: {}
                }
            }
        ];
    },
    addCommands() {
        return {
            osSplitLift:
                name =>
                ({ commands, tr }): boolean => {
                    const head = tr.selection.$head;
                    const classNames: string = head.node(head.depth - 3).attrs[`class`] ?? ``;
                    if (classNames.indexOf(`os-split-`) !== -1) {
                        return false;
                    }
                    return commands.liftListItem(name);
                }
        };
    }
});

export const OsSplitListItem = ListItem.extend({
    content() {
        return `paragraph* block*`;
    },
    addKeyboardShortcuts() {
        return {
            ...this.parent?.(),
            'Shift-Tab': (): boolean => {
                return this.editor.commands.osSplitLift(this.name);
            }
        };
    }
});

export const OsSplitBulletList = BulletList.extend({
    content() {
        return `${this.options.itemTypeName}+ paragraph*`;
    },

    addCommands() {
        return {
            toggleBulletList:
                () =>
                (args: CommandProps): boolean => {
                    const { tr } = args;
                    const head = tr.selection.$head;
                    if (head) {
                        const classNames: string = head.node(head.depth - 3)?.attrs[`class`] ?? ``;
                        if (classNames.indexOf(`os-split-`) !== -1) {
                            return false;
                        }
                    }

                    return this.parent().toggleBulletList()(args);
                }
        };
    }
});

export const OsSplitOrderedList = OrderedList.extend({
    content() {
        return `${this.options.itemTypeName}+ paragraph*`;
    },

    addCommands() {
        return {
            toggleOrderedList:
                () =>
                (args: CommandProps): boolean => {
                    const { tr } = args;
                    const head = tr.selection.$head;
                    if (head) {
                        const classNames: string = head.node(head.depth - 3)?.attrs[`class`] ?? ``;
                        if (classNames.indexOf(`os-split-`) !== -1) {
                            return false;
                        }
                    }

                    return this.parent().toggleOrderedList()(args);
                }
        };
    }
});
