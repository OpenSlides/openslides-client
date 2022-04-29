import { AfterViewInit, Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Deferred } from 'app/core/promises/deferred';

import { BaseFormControlComponent } from '../base-form-control';

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

    /**
     * Settings for the TinyMCE editor selector
     */
    private readonly tinyMceSettings = {
        base_url: `/tinymce`, // Root for resources
        suffix: `.min`, // Suffix to use when loading resources
        theme: `silver`,
        language: null,
        language_url: null,
        inline: false,
        statusbar: false,
        browser_spellcheck: true,
        image_advtab: true,
        image_description: false,
        link_title: false,
        height: 320,
        plugins: `autolink charmap code fullscreen image imagetools
        lists link paste searchreplace`,
        menubar: false,
        contextmenu: false,
        toolbar: `styleselect | bold italic underline strikethrough |
            forecolor backcolor removeformat | bullist numlist |
            link image charmap | code fullscreen`,
        mobile: {
            theme: `mobile`,
            plugins: [`autosave`, `lists`, `autolink`]
        },
        paste_preprocess: this.onPastePreprocess
    };

    public constructor(fb: FormBuilder, translate: TranslateService) {
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

    protected initializeForm(): void {
        this.contentForm = this.fb.control([``]);
    }

    protected updateForm(value: string): void {
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
