import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    OnDestroy,
    Output,
    ViewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Editor, Extension } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import { Level as HeadingLevel } from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import Image from '@tiptap/extension-image';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
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
import tinycolor from 'tinycolor2';

import {
    EditorEmbedDialogComponent,
    EditorEmbedDialogOutput
} from '../editor-embed-dialog/editor-embed-dialog.component';
import { EditorHtmlDialogComponent, EditorHtmlDialogOutput } from '../editor-html-dialog/editor-html-dialog.component';
import {
    EditorImageDialogComponent,
    EditorImageDialogOutput
} from '../editor-image-dialog/editor-image-dialog.component';
import { EditorLinkDialogComponent, EditorLinkDialogOutput } from '../editor-link-dialog/editor-link-dialog.component';
import { Highlight } from './extensions/highlight';
import IFrame from './extensions/iframe';
import { MSOfficePaste } from './extensions/office';
import { OrderedList } from './extensions/ordered-list';

const DEFAULT_COLOR_PALETE = [
    `#BFEDD2`,
    `#FBEEB8`,
    `#F8CAC6`,
    `#ECCAFA`,
    `#C2E0F4`,
    `#2DC26B`,
    `#F1C40F`,
    `#E03E2D`,
    `#B96AD9`,
    `#3598DB`,
    `#169179`,
    `#E67E23`,
    `#BA372A`,
    `#843FA1`,
    `#236FA1`,
    `#ECF0F1`,
    `#CED4D9`,
    `#95A5A6`,
    `#7E8C8D`,
    `#34495E`,
    `#000000`,
    `#FFFFFF`,
    `#A918BF`,
    `#CE4040`,
    `#44C8AC`
];

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

    @Input()
    public allowEmbeds = false;

    @Output()
    public leaveFocus = new EventEmitter<void>();

    public override contentForm!: UntypedFormControl;

    public editor: Editor;

    public editorReady = false;

    public headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

    public textColorSet = new Set(DEFAULT_COLOR_PALETE);
    public backgroundColorSet = new Set(DEFAULT_COLOR_PALETE);

    public get selectedHeadingLevel(): HeadingLevel {
        if (this.editor.isActive(`heading`)) {
            return this.editor.getAttributes(`heading`)[`level`];
        }

        return 1;
    }

    public get isGodButtonActive(): boolean {
        return (
            this.editor.isActive(`subscript`) ||
            this.editor.isActive(`superscript`) ||
            this.editor.isActive(`heading`) ||
            this.editor.isActive(`blockquote`)
        );
    }

    public get godButtonText(): string {
        if (this.editor.isActive(`subscript`)) {
            return this.translate.instant(`Subscript`);
        } else if (this.editor.isActive(`superscript`)) {
            return this.translate.instant(`Superscript`);
        } else if (this.editor.isActive(`heading`)) {
            return this.translate.instant(`Heading`) + ` ${this.selectedHeadingLevel}`;
        } else if (this.editor.isActive(`blockquote`)) {
            return this.translate.instant(`Blockquote`);
        }

        return this.translate.instant(`Paragraph`);
    }

    private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

    public constructor(private dialog: MatDialog, private translate: TranslateService) {
        super();
    }

    public ngAfterViewInit(): void {
        const editorConfig = {
            element: this.editorEl.nativeElement,
            extensions: [
                MSOfficePaste,
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
                Highlight.configure({
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
                        this.leaveFocus.emit();
                    },
                    onBlur: () => {
                        this.leaveFocus.emit();
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
        };

        if (this.allowEmbeds) {
            editorConfig.extensions.push(IFrame);
        }

        this.editor = new Editor(editorConfig);
        this.updateColorSets();
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.editor.destroy();
    }

    public updateColorSets(): void {
        // Safari and Firefox have their own color paletes so no presets necessary
        if (navigator.userAgent.search(`Firefox`) > -1 || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            this.textColorSet.clear();
            this.backgroundColorSet.clear();
        }

        // Add colors used in text to color palete
        if (this.value) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.value, `text/html`);
            const elements = doc.getElementsByTagName(`*`);
            for (let i = 0; i < elements.length; i++) {
                const el = <HTMLElement>elements[i];
                if (el.style.color) {
                    this.textColorSet.add(tinycolor(el.style.color).toHexString());
                }

                if (el.style.backgroundColor) {
                    this.backgroundColorSet.add(tinycolor(el.style.backgroundColor).toHexString());
                }
            }
        }
    }

    public godButtonAction(): void {
        if (this.editor.isActive(`subscript`)) {
            this.editor.chain().focus().toggleSubscript().run();
        } else if (this.editor.isActive(`superscript`)) {
            this.editor.chain().focus().toggleSuperscript().run();
        } else if (this.editor.isActive(`heading`)) {
            this.editor.chain().focus().toggleHeading({ level: this.selectedHeadingLevel }).run();
        } else if (this.editor.isActive(`blockquote`)) {
            this.editor.chain().focus().toggleBlockquote().run();
        }
    }

    public updateFontColor(e: Event): void {
        const val = (<any>e.target)?.value;
        if (val) {
            this.editor.chain().focus().setColor(val).run();
        }
    }

    public updateHighlightColor(e: Event): void {
        const val = (<any>e.target)?.value;
        if (val) {
            this.editor.chain().focus().setHighlight({ color: val }).run();
        }
    }

    public clearSelectedFormat(): void {
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
                width: `400px`,
                data: {
                    link: this.editor.getAttributes(`link`),
                    needsText: this.editor.state.selection.empty && !this.editor.isActive(`link`)
                }
            })
            .afterClosed()
            .subscribe((result: EditorLinkDialogOutput) => {
                if (!result) {
                    return;
                }

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
                width: `400px`,
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

    public async setEmbedDialog(): Promise<void> {
        this.dialog
            .open(EditorEmbedDialogComponent, {
                width: `400px`,
                data: {
                    embed: {
                        src: this.editor.getAttributes(`iframe`)[`src`],
                        title: this.editor.getAttributes(`iframe`)[`title`]
                    }
                }
            })
            .afterClosed()
            .subscribe((result?: EditorEmbedDialogOutput) => {
                if (result?.action === `set-embed`) {
                    this.editor.commands.setIframe({
                        src: result.embed.src,
                        title: result.embed.title
                    });
                }
            });
    }

    public editCode(): void {
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
