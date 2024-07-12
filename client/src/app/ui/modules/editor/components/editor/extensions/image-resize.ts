import Image from '@tiptap/extension-image';

export const ImageResize = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null
            },
            height: {
                default: null
            }
        };
    },
    addNodeView() {
        return ({ node, editor, getPos }): { dom: HTMLElement } => {
            const container = document.createElement(`div`);
            container.style.position = `relative`;
            container.style.display = `inline-flex`;

            const img = document.createElement(`img`);
            img.src = node.attrs[`src`];
            if (node.attrs[`width`]) {
                img.style.width = node.attrs[`width`] + `px`;
            }

            if (!editor.options.editable) return { dom: img };

            let isResizing = false;
            let startX: number, startWidth: number;

            const dotsPosition = [
                `top: -4px; left: -4px; cursor: nwse-resize;`,
                `top: -4px; right: -4px; cursor: nesw-resize;`,
                `bottom: -4px; left: -4px; cursor: nesw-resize;`,
                `bottom: -4px; right: -4px; cursor: nwse-resize;`
            ];

            container.addEventListener(`click`, _ => {
                for (let i = 0; i < 4; i++) {
                    const dot = document.createElement(`div`);
                    dot.setAttribute(
                        `style`,
                        `position: absolute; width: 9px; height: 9px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[i]}`
                    );

                    dot.addEventListener(`mousedown`, e => {
                        e.preventDefault();
                        isResizing = true;
                        startX = e.clientX;
                        startWidth = container.offsetWidth;

                        const onMouseMove = (e: MouseEvent): void => {
                            if (!isResizing) return;
                            const deltaX = i % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;
                            const newWidth = startWidth + deltaX;
                            container.style.width = newWidth + `px`;
                            img.style.width = newWidth + `px`;
                        };

                        const onMouseUp = (): void => {
                            if (isResizing) {
                                isResizing = false;
                            }

                            if (typeof getPos === `function`) {
                                const newAttrs = {
                                    ...node.attrs,
                                    width: `${img.style.width}`.substring(0, img.style.width.length - 2)
                                };
                                editor.view.dispatch(editor.view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
                            }

                            document.removeEventListener(`mousemove`, onMouseMove);
                            document.removeEventListener(`mouseup`, onMouseUp);
                        };

                        document.addEventListener(`mousemove`, onMouseMove);
                        document.addEventListener(`mouseup`, onMouseUp);
                    });

                    container.appendChild(dot);
                }
            });

            // TODO: Remove resize dots if not focussed anymore

            container.append(img);

            return {
                dom: container
            };
        };
    }
});
