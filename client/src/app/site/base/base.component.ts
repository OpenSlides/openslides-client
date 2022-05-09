import { Directive, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/gateways/storage.service';
import { SubscriptionMap } from 'src/app/infrastructure/utils/subscription-map';
import { AppInjector } from 'src/app/openslides-main-module/services/app-injector.service';

import { Id } from '../../domain/definitions/key-types';
import { CML, OML } from '../../domain/definitions/organization-permission';
import { Permission } from '../../domain/definitions/permission';
import { BaseModel } from '../../domain/models/base/base-model';
import { ErrorService } from '../services/error.service';
import { ModelRequestService } from '../services/model-request.service';

@Directive()
export abstract class BaseComponent implements OnDestroy {
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

    /**
     * Subscriptions added to this list will be cleared 'on destroy'
     */
    protected subscriptions = new SubscriptionMap();

    // Services which are injected manually to be available in all subclasses
    public router: Router;
    protected titleService: Title;
    protected modelRequestService: ModelRequestService;
    protected matSnackBar: MatSnackBar;
    protected storage: StorageService;
    protected translate: TranslateService;
    protected errorService: ErrorService;

    public constructor() {
        const injector = AppInjector.getInjector();
        this.router = injector.get(Router);
        this.titleService = injector.get(Title);
        this.modelRequestService = injector.get(ModelRequestService);
        this.matSnackBar = injector.get(MatSnackBar);
        this.storage = injector.get(StorageService);
        this.translate = injector.get(TranslateService);
        this.errorService = injector.get(ErrorService);
    }

    /**
     * automatically dismisses the error snack bar and clears subscriptions
     * if the component is destroyed.
     */
    public ngOnDestroy(): void {
        if (this.messageSnackBar) {
            this.messageSnackBar.dismiss();
        }

        this.cleanSubscriptions();
    }

    public updateSubscription(name: string, subscription: Subscription): void {
        this.clearSubscription(name);
        this.subscriptions.updateSubscription(name, subscription);
    }

    private clearSubscription(name: string): void {
        this.subscriptions.delete(name);
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
     * Helper for indexed *ngFor components
     *
     * @param index
     */
    public trackByIndex(index: number): number {
        return index;
    }

    /**
     * Helper for *ngFor => tracked items by their corresponding id.
     */
    public trackById(_index: number, item: Id | BaseModel): Id {
        return typeof item === `number` ? item : item.id;
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
        console.log(`raiseError`, message);
        this.errorService.showError(message);
    };

    /**
     * Opens the snack bar with the given message.
     * This snack bar will only dismiss if the user clicks the 'OK'-button.
     */
    protected raiseWarning = (message: string): void => {
        // this.messageSnackBar = this.matSnackBar.open(message, this.translate.instant(`OK`));
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
    protected cleanSubscriptions(): void {
        this.subscriptions.clear();
    }

    /**
     * To catch swipe gestures.
     * Should be overwritten by children which need swipe gestures
     */
    protected swipe(e: TouchEvent, when: string): void {}

    /**
     * TinyMCE Init callback. Used for certain mobile editors
     * @param event
     */
    public onInitTinyMce(event: any): void {
        if (event.event.target.settings.theme === `mobile`) {
            this.saveHint = true;
        } else {
            event.editor.focus();
        }
    }

    public onLeaveTinyMce(event: any): void {
        this.saveHint = false;
    }
}
