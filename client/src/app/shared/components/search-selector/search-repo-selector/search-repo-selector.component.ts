import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, Input, OnDestroy, OnInit, Optional, Self, ViewEncapsulation } from '@angular/core';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { ModelRequestService } from 'app/core/core-services/model-request.service';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { isModelRequestRepository, ModelRequestRepository } from 'app/core/repositories/model-request-repository';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { Settings } from 'app/shared/models/event-management/meeting';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseSearchValueSelectorComponent } from '../base-search-value-selector/base-search-value-selector.component';

@Component({
    selector: `os-search-repo-selector`,
    templateUrl: `../base-search-value-selector/base-search-value-selector.component.html`,
    styleUrls: [
        `../base-search-value-selector/base-search-value-selector.component.scss`,
        `./search-repo-selector.component.scss`
    ],
    providers: [{ provide: MatFormFieldControl, useExisting: SearchRepoSelectorComponent }],
    encapsulation: ViewEncapsulation.None
})
export class SearchRepoSelectorComponent extends BaseSearchValueSelectorComponent implements OnInit, OnDestroy {
    @Input()
    public set repo(repo: BaseRepository<any, any> & ModelRequestRepository) {
        if (!isModelRequestRepository(repo)) {
            throw new Error(`Only a repo implementing "ModelRequestRepository" can be set`);
        }
        this._repo = repo;
    }

    public get repo(): BaseRepository<any, any> & ModelRequestRepository {
        return this._repo;
    }

    /**
     * Function to pipe view-models received from the observable of a view-model list.
     */
    @Input()
    public pipeFn: OperatorFunction<any, any> = map(items => items);

    @Input()
    public lazyLoading = true;

    @Input()
    public defaultDataConfigKey: keyof Settings;

    public get controlType(): string {
        return `search-repo-selector`;
    }

    private _modelSubscription: ModelSubscription;
    private _repo: BaseRepository<any, any> & ModelRequestRepository;

    /**
     * Flag to indicate if the model-subscription was already made.
     * Prevents establishing a second model-subscription without closing it.
     */
    private _hasModelSubscriptionFired = false;

    public constructor(
        formBuilder: FormBuilder,
        @Optional() @Self() public ngControl: NgControl,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        private modelRequestService: ModelRequestService,
        private meetingSettingService: MeetingSettingsService
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }

    public ngOnInit(): void {
        this.init();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cleanModelSubscription();
    }

    public onContainerClick(): void {
        if (!this.selectableItems?.length) {
            this.doModelRequest().then(() => this.initItems());
        }
        super.onContainerClick();
    }

    protected async onAfterFirstUpdate(): Promise<void> {
        if (this.repo && !this.empty && !this._modelSubscription) {
            await this.doModelRequest();
            this.initItems();
        }
    }

    private async init(): Promise<void> {
        if (this.repo && (!this.lazyLoading || this.defaultDataConfigKey || !this.empty)) {
            await this.doModelRequest();
            this.initItems();
        }
        if (this.defaultDataConfigKey) {
            this.subscriptions.push(
                this.meetingSettingService.get(this.defaultDataConfigKey).subscribe(value => {
                    if (this.empty) {
                        this.value = value as any;
                    }
                })
            );
        }
    }

    private async doModelRequest(): Promise<void> {
        if (this._hasModelSubscriptionFired) {
            return;
        }
        this._hasModelSubscriptionFired = true;
        this.cleanModelSubscription();
        this._modelSubscription = await this.modelRequestService.subscribe(
            this.repo.getRequestToGetAllModels(),
            `${this.constructor.name}: ${this.repo.constructor.name}`
        );
    }

    private initItems(): void {
        const observer = this.repo.getViewModelListObservable();
        this.subscriptions.push(
            observer.pipe(this.pipeFn).subscribe(items => {
                this.selectableItems = items || [];
            })
        );
    }

    private cleanModelSubscription(): void {
        if (this._modelSubscription) {
            this._modelSubscription.close();
            this._modelSubscription = null;
        }
    }
}
