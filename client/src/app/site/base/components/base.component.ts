import { OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { Permission } from 'app/core/core-services/permission';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';

/**
 * Provides functionalities that will be used by most components
 * currently able to set the title with the suffix ' - OpenSlides'
 *
 * A BaseComponent is an OpenSlides Component.
 * Components in the 'Side'- or 'projector' Folder are BaseComponents
 */
export abstract class BaseComponent implements OnDestroy {
    /**
     * To check permissions in templates using permission.[...]
     */
    public permission = Permission;
    /**
     * To manipulate the browser title bar, adds the Suffix "OpenSlides"
     *
     * Might be a config variable later at some point
     */
    private titleSuffix = ' - OpenSlides';

    /**
     * Holds the coordinates where a swipe gesture was used
     */
    protected swipeCoord?: [number, number];

    /**
     * Holds the time when the user was swiping
     */
    protected swipeTime?: number;

    /**
     * Determine to display a save hint
     */
    public saveHint: boolean;

    /**
     * A reference to the current error snack bar.
     */
    private messageSnackBar: MatSnackBarRef<SimpleSnackBar>;

    /**
     * Subscriptions added to this list will be cleared 'on destroy'
     */
    protected subscriptions: Subscription[] = [];

    /**
     * Settings for the TinyMCE editor selector
     */
    public tinyMceSettings = {
        base_url: '/tinymce', // Root for resources
        suffix: '.min', // Suffix to use when loading resources
        theme: 'silver',
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
            theme: 'mobile',
            plugins: ['autosave', 'lists', 'autolink']
        }
    };

    protected get titleService(): Title {
        return this.componentServiceCollector.titleService;
    }

    protected get translate(): TranslateService {
        return this.componentServiceCollector.translate;
    }

    protected get matSnackBar(): MatSnackBar {
        return this.componentServiceCollector.matSnackBar;
    }

    public constructor(protected componentServiceCollector: ComponentServiceCollector) {
        this.tinyMceSettings.language_url = '/assets/tinymce/langs/' + this.translate.currentLang + '.js';
        this.tinyMceSettings.language = this.translate.currentLang;
    }

    /**
     * automatically dismisses the error snack bar and clears subscriptions
     * if the component is destroyed.
     */
    public ngOnDestroy(): void {
        if (this.messageSnackBar) {
            this.messageSnackBar.dismiss();
        }

        this.cleanSubjects();
    }

    /**
     * Set the title in web browser using angulars TitleService
     * @param prefix The title prefix. Should be translated here.
     */
    public setTitle(prefix: string): void {
        const translatedPrefix = this.translate.instant(prefix);
        this.titleService.setTitle(translatedPrefix + this.titleSuffix);
    }

    /**
     * Opens the snack bar with the given message.
     * This snack bar will only dismiss if the user clicks the 'OK'-button.
     */
    protected raiseWarning = (message: string): void => {
        this.messageSnackBar = this.matSnackBar.open(message, this.translate.instant('OK'));
    };

    /**
     * Opens an error snack bar with the given error message.
     * This is implemented as an arrow function to capture the called `this`. You can use this function
     * as callback (`.then(..., this.raiseError)`) instead of doing `this.raiseError.bind(this)`.
     *
     * @param message The message to show or an "real" error, which will be passed to the console.
     */
    protected raiseError = (message: string | Error): void => {
        let errorNotification: string;
        if (message instanceof Error) {
            if (message.message) {
                errorNotification = message.message;
            } else {
                errorNotification = this.translate.instant(
                    'A client error occurred. Please contact your system administrator.'
                );
            }
        } else {
            errorNotification = message;
        }
        this.messageSnackBar = this.matSnackBar.open(errorNotification, this.translate.instant('OK'), {
            duration: 0
        });
    };

    /**
     * Function to manually close the snack bar if it will not automatically close
     * or it should close in a previous step.
     */
    protected closeSnackBar(): void {
        if (this.matSnackBar) {
            this.matSnackBar.dismiss();
        }
    }

    /**
     * Manually clears all stored subscriptions.
     * Necessary for manual routing control, since the Angular
     * life cycle does not accept that navigation to the same URL
     * executes the life cycle again
     */
    protected cleanSubjects(): void {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
        this.subscriptions = [];
    }

    /**
     * Translate alternative  avoid endless loops during change detection
     * @param original the original string to translate
     */
    public translateSync(original: string): string {
        return this.translate.instant(original);
    }

    /**
     * To catch swipe gestures.
     * Should be overwritten by children which need swipe gestures
     */
    protected swipe(e: TouchEvent, when: string): void {}

    /**
     * Helper for indexed *ngFor components
     *
     * @param index
     */
    public trackByIndex(index: number): number {
        return index;
    }

    /**
     * TinyMCE Init callback. Used for certain mobile editors
     * @param event
     */
    protected onInitTinyMce(event: any): void {
        if (event.event.target.settings.theme === 'mobile') {
            this.saveHint = true;
        } else {
            event.editor.focus();
        }
    }

    protected onLeaveTinyMce(event: any): void {
        this.saveHint = false;
    }
}
