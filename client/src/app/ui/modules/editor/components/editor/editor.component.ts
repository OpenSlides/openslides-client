import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    inject,
    Input,
    OnDestroy,
    ViewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Editor, Extension } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import History from '@tiptap/extension-history';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Plugin } from '@tiptap/pm/state';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';

import { EditorHtmlDialogComponent, EditorHtmlDialogOutput } from '../editor-html-dialog/editor-html-dialog.component';
import {
    EditorImageDialogComponent,
    EditorImageDialogOutput
} from '../editor-image-dialog/editor-image-dialog.component';
import { EditorLinkDialogComponent, EditorLinkDialogOutput } from '../editor-link-dialog/editor-link-dialog.component';

const OfficePastePlugin = new Plugin({
    props: {
        transformPastedHTML(html: string) {
            if (html.indexOf(`MsoListParagraphCxSp`) === -1) {
                return html;
            }

            const doc = document.createElement(`div`);
            doc.innerHTML = html;

            const lists: HTMLElement[] = [];
            let currentUl: HTMLElement;
            doc.childNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                // Check if the element is part of a list
                const el = <HTMLElement>node;
                if (el.className.indexOf(`MsoListParagraphCxSp`) === -1) {
                    return;
                }

                if (el.className.indexOf(`MsoListParagraphCxSpFirst`) !== -1) {
                    if (/[0-9]*\./.test(el.firstElementChild.textContent)) {
                        currentUl = document.createElement(`ol`);
                    } else {
                        currentUl = document.createElement(`ul`);
                    }
                    lists.push(currentUl);
                    el.before(currentUl);
                }

                // Remove list item numbers
                if (el.firstElementChild.nodeName === `SPAN`) {
                    el.firstElementChild.remove();
                }

                // Get the mso list item level
                const li = document.createElement(`li`);
                li.innerHTML = el.innerHTML;
                const msoListValue: string = el.attributes[`style`].value
                    .split(`;`)
                    .find((style: string) => style.split(`:`)[0] === `mso-list`)
                    .split(`:`)[1];

                const listLevel = +msoListValue
                    .split(` `)
                    .find((e: string) => e.startsWith(`level`))
                    .substring(5);

                // Add list level attribute if element needs to be moved to sublist
                if (listLevel && listLevel > 1) {
                    li.dataset[`listLevel`] = `${listLevel - 1}`;
                }
                currentUl.appendChild(li);
                el.remove();
            });

            fixLists(lists);
            console.log(html, doc.innerHTML);
            return doc.innerHTML;
        }
    }
});

function fixLists(lists: HTMLElement[]) {
    const nextLists = [];
    for (const list of lists) {
        // list.childNodes.forEach((node: Element) => {
        let node = list.childNodes[0];
        while (node) {
            if (node.nodeName !== `LI`) {
                node = node.nextSibling;
                continue;
            }

            const el = <HTMLElement>node;
            node = node.nextSibling;
            if (+el.dataset[`listLevel`]) {
                el.dataset[`listLevel`] = `${+el.dataset[`listLevel`] - 1}`;
                if (!el.previousElementSibling) {
                    return;
                }

                // Check if parent already has a sublist
                let sublist: HTMLElement = document.createElement(list.nodeName);
                if (el.previousElementSibling?.lastElementChild?.nodeName === list.nodeName) {
                    sublist = <HTMLElement>el.previousElementSibling.lastElementChild;
                } else {
                    el.previousElementSibling.appendChild(sublist);
                    nextLists.push(sublist);
                }

                sublist.appendChild(el);
            }
        }
    }

    if (nextLists.length) {
        fixLists(nextLists);
    }
}

@Component({
    selector: `os-editor`,
    templateUrl: `./editor.component.html`,
    styleUrls: [`./editor.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorComponent), multi: true }]
})
export class EditorComponent extends BaseFormControlComponent<string> implements AfterViewInit, OnDestroy {
    @ViewChild(`editorEl`) private editorEl: ElementRef;

    @Input()
    public customSettings: object = {};

    public override contentForm!: UntypedFormControl;

    public editor: Editor;

    public editorReady = false;

    private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

    constructor(private dialog: MatDialog) {
        super();
    }

    public ngAfterViewInit(): void {
        this.editor = new Editor({
            element: this.editorEl.nativeElement,
            extensions: [
                Extension.create({
                    addProseMirrorPlugins() {
                        return [OfficePastePlugin];
                    }
                }),
                // Nodes
                Document,
                Blockquote,
                BulletList,
                HardBreak,
                Heading,
                Image,
                ListItem,
                OrderedList,
                Paragraph,
                Text,
                Table,
                TableRow,
                TableHeader,
                TableCell,

                //Marks
                Bold,
                Highlight.extend({
                    parseHTML() {
                        return [
                            ...this.parent(),
                            {
                                tag: `span`,
                                getAttrs: node => !!(node as HTMLElement).style?.backgroundColor && null
                            }
                        ];
                    }
                }).configure({
                    multicolor: true
                }),
                Italic,
                Link.extend({
                    inclusive: false
                }),
                Strike,
                Subscript,
                Superscript,
                TextStyle,
                Underline,

                // Extensions
                Color,
                History,
                TextAlign.configure({
                    types: [`heading`, `paragraph`]
                }),
                Extension.create({
                    onCreate: () => {
                        this.editorReady = true;
                        this.cd.detectChanges();
                    },
                    onDestroy: () => {
                        this.editorReady = false;
                    },
                    onSelectionUpdate: () => {
                        this.cd.detectChanges();
                    },
                    onUpdate: () => {
                        const content = this.editor.getHTML();
                        if (this.value != content) {
                            this.updateForm(content);
                        }
                    }
                })
            ],
            content: this.value
        });
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.editor.destroy();
    }

    public updateFontColor(e: Event) {
        const val = (<any>e.target)?.value;
        if (val) {
            this.editor.chain().focus().setColor(val).run();
        }
    }

    public updateHighlightColor(e: Event) {
        const val = (<any>e.target)?.value;
        if (val) {
            this.editor.chain().focus().setHighlight({ color: val }).run();
        }
    }

    public clearSelectedFormat() {
        this.editor
            .chain()
            .focus()
            .unsetBold()
            .unsetStrike()
            .unsetItalic()
            .unsetUnderline()
            .unsetColor()
            .unsetHighlight()
            .removeEmptyTextStyle()
            .run();
    }

    public async setLinkDialog(): Promise<void> {
        this.dialog
            .open(EditorLinkDialogComponent, {
                data: {
                    link: this.editor.getAttributes(`link`),
                    needsText: this.editor.state.selection.empty && !this.editor.isActive(`link`)
                }
            })
            .afterClosed()
            .subscribe((result: EditorLinkDialogOutput) => {
                const chain = this.editor.chain().focus().extendMarkRange(`link`);
                if (result.action === `remove-link`) {
                    chain.unsetLink().run();
                } else if (result.action === `set-link`) {
                    if (result.link) {
                        if (result.text) {
                            chain
                                .insertContent({
                                    type: `text`,
                                    text: result.text,
                                    marks: [
                                        {
                                            type: `link`,
                                            attrs: result.link
                                        }
                                    ]
                                })
                                .run();
                        } else {
                            chain.setLink(result.link).run();
                        }
                    }

                    this.editor.chain().focus(this.editor.state.selection.to).unsetMark(`link`).run();
                }
            });
    }

    public async setImageDialog(): Promise<void> {
        this.dialog
            .open(EditorImageDialogComponent, {
                data: {
                    image: {
                        src: this.editor.getAttributes(`image`)[`src`],
                        alt: this.editor.getAttributes(`image`)[`alt`],
                        title: this.editor.getAttributes(`image`)[`title`]
                    }
                }
            })
            .afterClosed()
            .subscribe((result?: EditorImageDialogOutput) => {
                if (result?.action === `set-image`) {
                    this.editor.commands.setImage({
                        src: result.image.src,
                        title: result.image.title,
                        alt: result.image.alt
                    });
                }
            });
    }

    public editCode() {
        this.dialog
            .open(EditorHtmlDialogComponent, {
                data: this.editor.getHTML()
            })
            .afterClosed()
            .subscribe((result: EditorHtmlDialogOutput) => {
                if (result.action === `set`) {
                    this.editor.commands.setContent(result.html, true);
                }
            });
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control([``]);
    }

    protected updateForm(value: string | null): void {
        this.contentForm.setValue(value);
    }
}
