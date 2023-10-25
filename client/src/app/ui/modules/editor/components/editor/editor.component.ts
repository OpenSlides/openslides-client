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
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';

import { EditorLinkDialogComponent } from '../editor-link-dialog/editor-link-dialog.component';

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

                //Marks
                Bold,
                Highlight,
                Italic,
                Link,
                Strike,
                Subscript,
                Superscript,
                TextStyle,
                Underline,

                // Extensions
                Color,
                History,
                TextAlign,
                Extension.create({
                    onSelectionUpdate: () => {
                        this.cd.detectChanges();
                    },
                    onUpdate: () => {
                        this.updateForm(this.editor.getHTML());
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
                data: this.editor.getAttributes(`link`)
            })
            .afterClosed()
            .subscribe(result => {
                if (result) {
                    this.editor.chain().focus().setLink(result).run();
                } else if (result === null) {
                    this.editor.chain().focus().unsetLink().run();
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
