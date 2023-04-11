import { AfterViewInit, Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';
import { RawEditorSettings } from 'tinymce';

@Component({
    selector: `os-editor`,
    templateUrl: `./editor.component.html`,
    styleUrls: [`./editor.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorComponent), multi: true }]
})
export class EditorComponent extends BaseFormControlComponent<string> implements AfterViewInit {
    @Input()
    public customSettings: object = {};

    public readonly hasInitialized = new Deferred<boolean>();

    public override contentForm!: UntypedFormControl;

    /**
     * Settings for the TinyMCE editor selector
     */
    public tinyMceSettings: RawEditorSettings = {
        base_url: `/tinymce`, // Root for resources
        suffix: `.min`, // Suffix to use when loading resources
        theme: `silver`,
        language: ``,
        language_url: ``,
        inline: false,
        statusbar: false,
        browser_spellcheck: true,
        image_advtab: true,
        image_description: false,
        relative_urls: false,
        link_title: false,
        height: 320,
        style_formats: [
            {
                title: _(`Headers`),
                items: [
                    { title: _(`Header 1`), format: `h1` },
                    { title: _(`Header 2`), format: `h2` },
                    { title: _(`Header 3`), format: `h3` },
                    { title: _(`Header 4`), format: `h4` },
                    { title: _(`Header 5`), format: `h5` },
                    { title: _(`Header 6`), format: `h6` }
                ]
            },
            {
                title: _(`Inline`),
                items: [
                    { title: _(`Bold`), icon: `bold`, format: `bold` },
                    { title: _(`Italic`), icon: `italic`, format: `italic` },
                    { title: _(`Underline`), icon: `underline`, format: `underline` },
                    { title: _(`Strikethrough`), format: `strikethrough` },
                    { title: _(`Superscript`), icon: `superscript`, format: `superscript` },
                    { title: _(`Subscript`), icon: `subscript`, format: `subscript` },
                    { title: _(`Code`), format: `code` }
                ]
            },
            {
                title: _(`Blocks`),
                items: [
                    { title: _(`Paragraph`), format: `p` },
                    { title: _(`Div`), format: `div` },
                    { title: _(`Pre`), format: `pre` }
                ]
            },
            {
                title: _(`Alignment`),
                items: [
                    { title: _(`Left`), format: `alignleft` },
                    { title: _(`Center`), format: `aligncenter` },
                    { title: _(`Right`), format: `alignright` },
                    { title: _(`Justify`), format: `alignjustify` }
                ]
            }
        ],
        plugins: `autolink charmap code fullscreen image imagetools
        lists link paste searchreplace`,
        menubar: false,
        contextmenu: false,
        setup: editor => {
            editor.on(`FullscreenStateChanged`, event => {
                this.onFullscreenChanged(event);
            });
        },
        toolbar: `styleselect | bold italic underline strikethrough |
            forecolor backcolor removeformat | bullist numlist |
            link image charmap | code fullscreen`,
        mobile: {
            theme: `mobile`,
            plugins: [`autosave`, `lists`, `autolink`]
        },
        paste_preprocess: this.onPastePreprocess
    };

    public constructor(fb: UntypedFormBuilder, translate: TranslateService) {
        super(fb);
        this.tinyMceSettings.language_url = `/assets/tinymce/langs/` + translate.currentLang + `.js`;
        this.tinyMceSettings.language = translate.currentLang;
    }

    public ngAfterViewInit(): void {
        this.hasInitialized.resolve(true);
    }

    public getEditorSettings(): object {
        return {
            ...this.tinyMceSettings,
            ...this.customSettings
        };
    }

    public onFullscreenChanged(event: any): void {
        const element = document.querySelector(`mat-sidenav`) as HTMLElement;
        if (event[`state`]) {
            element.style.zIndex = `0`;
        } else {
            element.style.zIndex = null;
        }
    }

    protected createForm(): UntypedFormControl {
        return this.fb.control([``]);
    }
    protected updateForm(value: string | null): void {
        this.contentForm.setValue(value);
    }

    /**
     * Clean pasted HTML.
     * If the user decides to copy-paste HTML (like from another OpenSlides motion detail)
     * - remove all classes
     * - remove data-line-number="X"
     * - remove contenteditable="false"
     *
     * Not doing so would save control sequences from diff/linenumbering into the
     * model which will open pandoras pox during PDF generation (and potentially web view)
     * @param _
     * @param args
     */
    private onPastePreprocess(_: any, args: any): void {
        const getClassesRe = new RegExp(/\s*class\=\"[\w\W]*?\"/, `gi`);
        const getDataLineNumberRe = new RegExp(/\s*data-line-number\=\"\d+\"/, `gi`);
        const getContentEditableRe = new RegExp(/\s*contenteditable\=\"\w+\"/, `gi`);
        const cleanedContent = (args.content as string)
            .replace(getClassesRe, ``)
            .replace(getDataLineNumberRe, ``)
            .replace(getContentEditableRe, ``);
        args.content = cleanedContent;
    }
}
