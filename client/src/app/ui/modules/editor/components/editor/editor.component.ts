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
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';

import { EditorHtmlDialogComponent, EditorHtmlDialogOutput } from '../editor-html-dialog/editor-html-dialog.component';
import { EditorLinkDialogComponent, EditorLinkDialogOutput } from '../editor-link-dialog/editor-link-dialog.component';

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
                                getAttrs: node => (node as HTMLElement).style.backgroundColor && null
                            }
                        ];
                    }
                }).configure({
                    multicolor: true
                }),
                Italic,
                Link.extend({
                    inclusive: false
                }).configure({
                    openOnClick: false
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

    public async setLinkDialog() {
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

    public todo() {
        alert(`Not implemented`);
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control([``]);
    }

    protected updateForm(value: string | null): void {
        this.contentForm.setValue(value);
    }
}
