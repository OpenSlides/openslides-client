import { Directive, inject, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { CML, OML } from '../../domain/definitions/organization-permission';
import { Permission } from '../../domain/definitions/permission';
import { ComponentServiceCollectorService } from '../services/component-service-collector.service';
import { ModelRequestService } from '../services/model-request.service';

@Directive()
export abstract class BaseComponent extends BaseUiComponent implements OnDestroy {
    /**
     * To check permissions in templates using permission.[...]
     */
    public readonly permission = Permission;

    /**
     * To access the OML in templates
     */
    public readonly OML = OML;

    /**
     * To access the CML in templates
     */
    public readonly CML = CML;

    /**
     * To manipulate the browser title bar, adds the Suffix "OpenSlides"
     *
     * Might be a config variable later at some point
     */
    private titleSuffix = ` - OpenSlides`;

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
    public saveHint = false;

    /**
     * A reference to the current error snack bar.
     */
    private messageSnackBar: MatSnackBarRef<SimpleSnackBar> | null = null;

    protected get titleService(): Title {
        return this.componentServiceCollector.titleService;
    }

    protected get modelRequestService(): ModelRequestService {
        return this.componentServiceCollector.modelRequestService;
    }

    protected get matSnackBar(): MatSnackBar {
        return this.componentServiceCollector.matSnackBar;
    }

    protected get storage(): StorageService {
        return this.componentServiceCollector.storage;
    }

    public get router(): Router {
        return this.componentServiceCollector.router;
    }

    protected componentServiceCollector = inject(ComponentServiceCollectorService);
    protected translate = inject(TranslateService);

    /**
     * automatically dismisses the error snack bar and clears subscriptions
     * if the component is destroyed.
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.messageSnackBar) {
            this.messageSnackBar.dismiss();
        }
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
     * Translate alternative  avoid endless loops during change detection
     * @param original the original string to translate
     */
    public translateSync(original: string): string {
        return this.translate.instant(original);
    }

    /**
     * Opens an error snack bar with the given error message.
     * This is implemented as an arrow function to capture the called `this`. You can use this function
     * as callback (`.then(..., this.raiseError)`) instead of doing `this.raiseError.bind(this)`.
     *
     * @param message The message to show or an "real" error, which will be passed to the console.
     */
    public raiseError = (message: any): void => {
        console.debug(`raiseError`, message);
        let errorNotification: string;
        if (message instanceof Error) {
            if (message.message) {
                errorNotification = message.message;
            } else {
                errorNotification = this.translate.instant(
                    `A client error occurred. Please contact your system administrator.`
                );
            }
        } else {
            errorNotification = message;
        }
        this.messageSnackBar = this.matSnackBar.open(
            this.translate.instant(errorNotification),
            this.translate.instant(`OK`),
            {
                duration: 0
            }
        );
    };

    /**
     * Opens the snack bar with the given message.
     * This snack bar will only dismiss if the user clicks the 'OK'-button.
     */
    protected raiseWarning = (message: string): void => {
        this.messageSnackBar = this.matSnackBar.open(this.translate.instant(message), this.translate.instant(`OK`));
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
     * To catch swipe gestures.
     * Should be overwritten by children which need swipe gestures
     */
    protected swipe(_e: TouchEvent, _when: string): void {}
}
