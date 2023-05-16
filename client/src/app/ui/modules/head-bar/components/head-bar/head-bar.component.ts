import { TemplatePortal } from '@angular/cdk/portal';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { GlobalHeadbarService } from 'src/app/site/modules/global-headbar/global-headbar.service';

import { MainMenuService } from '../../../../../site/pages/meetings/services/main-menu.service';
import { ViewPortService } from '../../../../../site/services/view-port.service';
import { RoutingStateService } from '../../services/routing-state.service';

export const HEAD_BAR_HEIGHT = 50; // height of the head-bar in px.

/**
 * Reusable head bar component for Apps.
 *
 * Will translate the title automatically.
 *
 * ## Examples:
 *
 * ### Usage of the selector:
 *
 * ```html
 * <os-head-bar
 *   prevUrl="../.."
 *   saveText="Create"
 *   [nav]="false"
 *   [goBack]="true"
 *   [hasMainButton]="opCanEdit()"
 *   [mainButtonIcon]="edit"
 *   [backButtonIcon]="arrow_back"
 *   [editMode]="editMotion"
 *   [isSaveButtonEnabled]="myConditionIsTrue()"
 *   [multiSelectMode]="isMultiSelect"
 *   (mainEvent)="setEditMode(!editMotion)"
 *   (saveEvent)="saveMotion()">
 *
 *     <!-- Title -->
 *     <div class="title-slot">
 *         My Component Title
 *     </div>
 *
 *     <!-- Menu -->
 *     <div class="menu-slot">
 *         <button type="button" mat-icon-button [matMenuTriggerFor]="myComponentMenu">
 *             <mat-icon>more_vert</mat-icon>
 *         </button>
 *     </div>
 *     <!-- MultiSelect info -->
 *     <div class="central-info-slot">
 *     <button mat-icon-button (click)="toggleMultiSelect()">
 *         <mat-icon>arrow_back</mat-icon>
 *     </button>
 *         <span>{{ selectedRows.length }}&nbsp;</span><span>selected</span>
 * </div>
 * </os-head-bar>
 * ```
 */
@Component({
    selector: `os-head-bar`,
    templateUrl: `./head-bar.component.html`,
    styleUrls: [`./head-bar.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class HeadBarComponent implements OnInit, AfterViewInit {
    /**
     * Determine if the the navigation "hamburger" icon should be displayed in mobile mode
     */
    @Input()
    public nav = true;

    /**
     * Custom icon if necessary
     */
    @Input()
    public mainButtonIcon = `add_circle`;

    /**
     * Custom text to show as "save"
     */
    @Input()
    public saveText = `Save`;

    /**
     * Determine edit mode
     */
    @Input()
    public editMode = false;

    /**
     * Determine, if the search should not be available.
     */
    @Input()
    public isSearchEnabled = true;

    /**
     * The save button can manually be disabled.
     */
    @Input()
    public set isSaveButtonEnabled(value: boolean | undefined) {
        this._isSaveButtonEnabled = value || false;
    }

    @ViewChild(`headbarContent`) headbarContent: TemplateRef<unknown>;

    public get isSaveButtonEnabled(): boolean {
        return this._isSaveButtonEnabled;
    }

    /**
     * Determine multiSelect mode: changed interactions and head bar
     */
    @Input()
    public multiSelectMode = false;

    /**
     * Determine if there should be the main action button
     */
    @Input()
    public hasMainButton = false;

    /**
     * Determine if the main action button should be enabled or not.
     */
    @Input()
    public isMainButtonEnabled = true;

    /**
     * Set to true if the component should use location.back instead
     * of navigating to the parent component
     */
    @Input()
    public goBack = false;

    /**
     * Determine the back URL. Default is ".." (previous parent page)
     * Lazy Loaded modules sometimes have different routing events or require
     * special "back" logic.
     * Has only an effect if goBack is set to false
     */
    @Input()
    public prevUrl = `..`;

    /**
     * Optional tooltip for the main action
     */
    @Input()
    public mainActionTooltip: string = ``;

    /**
     * Provide a custom menu and ignores the menu service trigger
     * Used for OS4 management views
     */
    @Input()
    public customMenu = false;

    /**
     * An action can be provided, which should be executed when clicking the "save" button.
     * This has the effect, that the "save"-button is automatically exchanged with a pending spinner.
     */
    @Input()
    public saveAction: (() => Promise<void>) | undefined;

    /**
     * Emit a signal to the parent component if the main button was clicked
     */
    @Output()
    public mainEvent = new EventEmitter<void>();

    /**
     * Optional custom event for cancel the edit
     */
    @Output()
    public cancelEditEvent = new EventEmitter<void>();

    /**
     * To detect if the cancel event was used
     */
    public isCancelEditUsed = false;

    /**
     * Sends a signal if a detail view should be saved
     */
    @Output()
    public saveEvent = new EventEmitter<void>();

    public get showBackButton(): boolean {
        return !this.nav && !this.multiSelectMode && (this.routingState.isSafePrevUrl || !this.goBack);
    }

    public get isSavingObservable(): Observable<boolean> {
        return this._isSavingSubject.asObservable();
    }

    private _isSavingSubject = new BehaviorSubject(false);
    private _isSaveButtonEnabled = true;

    /**
     * Empty constructor
     */
    public constructor(
        public vp: ViewPortService,
        private menu: MainMenuService,
        private router: Router,
        private route: ActivatedRoute,
        private routingState: RoutingStateService,
        private headbarService: GlobalHeadbarService,
        private _viewContainerRef: ViewContainerRef
    ) {}

    /**
     * Detect if the cancel edit event was used
     */
    public ngOnInit(): void {
        this.isCancelEditUsed = this.cancelEditEvent.observers.length > 0;
    }

    public ngAfterViewInit(): void {
        this.headbarService.headbar = new TemplatePortal(this.headbarContent, this._viewContainerRef);
    }

    /**
     * Emits a signal to the parent if
     */
    public sendMainEvent(): void {
        this.mainEvent.next();
    }

    /**
     * Emits a signal to for custom cancel edits
     */
    public sendCancelEditEvent(): void {
        this.cancelEditEvent.next();
    }

    /**
     * Clicking the burger-menu-icon should toggle the menu
     */
    public clickHamburgerMenu(): void {
        this.menu.toggleMenu();
    }

    /**
     * Send a save signal and set edit mode
     */
    public async save(): Promise<void> {
        if (this.saveAction) {
            this._isSavingSubject.next(true);
            try {
                await this.saveAction();
            } finally {
                this._isSavingSubject.next(false);
            }
        } else {
            this.saveEvent.emit();
        }
    }

    /**
     * Exits the view to return to the previous page or
     * visit the parent view again.
     */
    public onBackButton(): void {
        if (this.goBack) {
            this.routingState.goBack();
        } else if (this.routingState.customOrigin && this.routingState.customOrigin !== this.router.url) {
            this.router.navigate([this.routingState.customOrigin], { relativeTo: this.route });
        } else {
            const relativeToRoute = !!this.route.snapshot.url.length ? this.route : this.route.parent;
            this.router.navigate([this.prevUrl], { relativeTo: relativeToRoute });
        }
    }
}
