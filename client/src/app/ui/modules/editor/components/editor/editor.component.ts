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
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import OfficePaste from '@intevation/tiptap-extension-office-paste';
import { TranslateService } from '@ngx-translate/core';
import { Editor, Extension } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Color } from '@tiptap/extension-color';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Level as HeadingLevel } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Text } from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { UndoRedo } from '@tiptap/extensions';
import { unwrapNode } from 'src/app/infrastructure/utils/dom-helpers';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';
import tinycolor from 'tinycolor2';

import { EditorTabNavigationDirective } from '../../directives/tab-navigation.directive';
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
import { ClearTextcolorPaste } from './extensions/clear-textcolor';
import { Highlight } from './extensions/highlight';
import IFrame from './extensions/iframe';
import { ImageResize } from './extensions/image-resize';
import { OsSplit, OsSplitBulletList, OsSplitListItem, OsSplitOrderedList } from './extensions/os-split';
import { TextStyle } from './extensions/text-style';

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
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorComponent), multi: true }],
    standalone: false
})
export class EditorComponent extends BaseFormControlComponent<string> implements AfterViewInit, OnDestroy {
    @ViewChild(`editorEl`) private editorEl: ElementRef;

    @ViewChildren(`btn`)
    public buttonElements!: QueryList<ElementRef>;

    @ViewChild(`isDisabled`) public isDisabled: EditorTabNavigationDirective;

    @ViewChild(`setTab`) public setTab: EditorTabNavigationDirective;

    @Input()
    public customSettings: object = {};

    @Input()
    public allowEmbeds = false;

    @Output()
    public leaveFocus = new EventEmitter<void>();

    public focusText = false;
    public focusBackground = false;

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
        if (!['textAlign', 'subscript', 'superscript'].some(this.isExtensionActive)) {
            return this.translate.instant(`Heading`);
        } else if (this.editor.isActive(`subscript`)) {
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

    protected cd: ChangeDetectorRef = inject(ChangeDetectorRef);
    private dialog: MatDialog = inject(MatDialog);
    private translate: TranslateService = inject(TranslateService);

    private domParser = new DOMParser();

    public constructor() {
        super();
    }

    public ngAfterViewInit(): void {
        const editorConfig = {
            element: this.editorEl.nativeElement,
            extensions: this.getExtensions(),
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
        this.editor?.destroy();
    }

    public override writeValue(value: string): void {
        super.writeValue(value);
        if (this.editor) {
            this.editor.commands.setContent(value);
        }
    }

    public isExtensionActive = (extension: string): boolean =>
        !!this.editor.extensionManager.extensions.find(ext => ext.name === extension);

    public getExtensions(): Extension[] {
        return [
            OfficePaste,
            ClearTextcolorPaste,
            // Nodes
            Document,
            Blockquote,
            HardBreak,
            Heading,
            ImageResize.configure({
                inline: true
            }),
            OsSplitBulletList,
            OsSplitOrderedList,
            OsSplitListItem,
            Paragraph,
            Text,
            Table,
            TableRow,
            TableHeader,
            TableCell,

            // Marks
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
            UndoRedo,
            TextAlign.configure({
                types: [`heading`, `paragraph`]
            }),
            OsSplit,
            this.ngExtension()
        ];
    }

    public ngExtension(): Extension {
        return Extension.create({
            name: `angular-component-ext`,
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
                const content = this.cleanupOutput(this.editor.getHTML());
                if (this.value != content) {
                    this.updateForm(content);
                }
            }
        });
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
            for (const element of elements) {
                const el = element as HTMLElement;
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
        const val = (e.target as any)?.value;
        if (val) {
            this.editor.chain().focus().setColor(val).run();
        }
    }

    public updateHighlightColor(e: Event): void {
        const val = (e.target as any)?.value;
        if (val) {
            this.editor.chain().focus().setHighlight({ color: val }).run();
        }
    }

    public clearSelectedFormat(): void {
        try {
            this.editor
                .chain()
                .focus()
                .selectAll()
                .unsetHighlight()
                .unsetStrike()
                .unsetItalic()
                .unsetUnderline()
                .unsetColor()
                .blur()
                .run();
        } catch (error) {
            console.error(error);
        } finally {
            this.editor
            .chain()
            .focus()
            .selectAll()
            .unsetBold()
            .removeEmptyTextStyle()
            .blur()
            .run();
        }
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
                    this.editor.commands.setImage(
                        Object.assign({}, this.editor.getAttributes(`image`), {
                            src: result.image.src,
                            title: result.image.title,
                            alt: result.image.alt
                        })
                    );
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
                data: this.cleanupOutput(this.editor.getHTML())
            })
            .afterClosed()
            .subscribe((result: EditorHtmlDialogOutput) => {
                if (result.action === `set`) {
                    this.editor.commands.setContent(result.html);
                }
            });
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control([``]);
    }

    protected updateForm(value: string | null): void {
        this.contentForm.setValue(value);
    }

    private cleanupOutput(html: string): string {
        const dom = this.domParser.parseFromString(html, `text/html`);

        // Remove paragraphs inside list elements
        const listParagraphs = dom.querySelectorAll(`li > p`);
        for (const item of listParagraphs) {
            unwrapNode(item);
        }

        // if editor is limited remove empty span
        // color is the only element which we support which produce spans
        if (!this.isExtensionActive(`color`)) {
            const spanElements = dom.querySelectorAll(`span`);
            for (const item of spanElements) {
                item.style.removeProperty(`color`);
                if (item.getAttribute(`style`) === ``) {
                    unwrapNode(item);
                }
            }
        }

        if (!this.editor.getText() && !dom.images.length) {
            return ``;
        }

        return dom.body.innerHTML;
    }

    public setFocus(help?: boolean): void {
        this.focusText = help;
        if (help === undefined) {
            this.focusBackground = help;
        } else {
            this.focusBackground = !help;
        }
    }
}
