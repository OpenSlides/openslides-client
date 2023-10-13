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
import { Editor, Extension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';

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

    public ngAfterViewInit(): void {
        this.editor = new Editor({
            element: this.editorEl.nativeElement,
            extensions: [
                Document,
                Paragraph,
                Text,
                Heading,
                BulletList,
                ListItem,
                Bold,
                Italic,
                Strike,
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
        console.log(this.editor);
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.editor.destroy();
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control([``]);
    }

    protected updateForm(value: string | null): void {
        this.contentForm.setValue(value);
    }
}
