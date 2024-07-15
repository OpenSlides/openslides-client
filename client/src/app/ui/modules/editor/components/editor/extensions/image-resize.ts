import Image from '@tiptap/extension-image';
import { Node } from '@tiptap/pm/model';

function createImageFromNode(node: Node): HTMLElement {
    const img = document.createElement(`img`);
    img.src = node.attrs[`src`];
    img.alt = node.attrs[`alt`];
    img.title = node.attrs[`title`];
    if (node.attrs[`width`]) {
        img.style.width = node.attrs[`width`] + `px`;
    }

    return img;
}

const lastDotPos = [true, false, false, true];
function getNextDot(): HTMLElement {
    const dot = document.createElement(`div`);
    lastDotPos.push(lastDotPos.shift());
    const cursor = (lastDotPos[0] && lastDotPos[1]) || (lastDotPos[2] && lastDotPos[3]) ? `nwse` : `nesw`;
    dot.setAttribute(
        `style`,
        `position: absolute; width: 9px; height: 9px; border: 1.5px solid #6C6C6C; border-radius: 50%;
            cursor: ${cursor}-resize;
            top: ${lastDotPos[0] ? `-4px` : `auto`};
            left: ${lastDotPos[1] ? `-4px` : `auto`};
            bottom: ${lastDotPos[2] ? `-4px` : `auto`};
            right: ${lastDotPos[3] ? `-4px` : `auto`};`
    );

    return dot;
}

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

            const img = createImageFromNode(node);
            if (!editor.options.editable) return { dom: img };

            let isResizing = false;
            let startX: number, startWidth: number;

            container.addEventListener(`click`, _ => {
                for (let i = 0; i < 4; i++) {
                    const dot = getNextDot();

                    dot.addEventListener(`mousedown`, e => {
                        e.preventDefault();
                        isResizing = true;
                        startX = e.clientX;
                        startWidth = container.offsetWidth;

                        const onMouseMove = (e: MouseEvent): void => {
                            if (!isResizing) return;
                            const deltaX = i === 1 || i === 2 ? -(e.clientX - startX) : e.clientX - startX;
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

            document.addEventListener(`click`, (e: MouseEvent) => {
                if (!container.contains(e.target as HTMLElement)) {
                    const dots = container.querySelectorAll(`div`);
                    for (let i = 0; i < dots.length; i++) {
                        container.removeChild(dots.item(i));
                    }
                }
            });

            container.append(img);

            return {
                dom: container
            };
        };
    }
});
