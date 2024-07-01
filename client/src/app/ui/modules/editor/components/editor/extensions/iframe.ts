import { mergeAttributes, Node } from '@tiptap/core';

export interface IframeOptions {
    inline: boolean;
    HTMLAttributes: {
        [key: string]: any;
    };
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        iframe: {
            /**
             * Add an iframe
             */
            setIframe: (options: { src: string; title?: string }) => ReturnType;
        };
    }
}

export default Node.create<IframeOptions>({
    name: `iframe`,

    group() {
        return this.options.inline ? `inline` : `block`;
    },

    inline() {
        return this.options.inline;
    },

    draggable: true,

    addOptions() {
        return {
            inline: true,
            HTMLAttributes: {}
        };
    },

    addAttributes() {
        return {
            src: {
                default: null
            },
            title: {
                default: null
            },
            frameborder: {
                default: 0
            },
            width: {
                default: null
            },
            height: {
                default: null
            },
            sandbox: {
                default: `allow-scripts allow-same-origin`
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: `iframe`
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        if (!this.options.inline) {
            return [`div`, this.options.HTMLAttributes, [`iframe`, HTMLAttributes]];
        }

        return [`iframe`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setIframe:
                (options: { src: string; title?: string }) =>
                ({ tr, dispatch }) => {
                    const { selection } = tr;
                    const node = this.type.create(options);

                    if (dispatch) {
                        tr.replaceRangeWith(selection.from, selection.to, node);
                    }

                    return true;
                }
        };
    }
});
