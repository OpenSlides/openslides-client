import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, Input, OnInit, Optional, Self, ViewEncapsulation } from '@angular/core';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { ModelRequestService } from 'app/core/core-services/model-request.service';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { ModelRequestRepository } from 'app/core/repositories/model-request-repository';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { Settings } from 'app/shared/models/event-management/meeting';
import { BaseSearchValueSelectorComponent } from '../base-search-value-selector';
import { Selectable } from '../selectable';

@Component({
    selector: 'os-search-repo-selector',
    templateUrl: './search-repo-selector.component.html',
    styleUrls: ['./search-repo-selector.component.scss'],
    providers: [{ provide: MatFormFieldControl, useExisting: SearchRepoSelectorComponent }],
    encapsulation: ViewEncapsulation.None
})
export class SearchRepoSelectorComponent extends BaseSearchValueSelectorComponent<Selectable> implements OnInit {
    @Input()
    public repo: BaseRepository<any, any> & ModelRequestRepository;

    @Input()
    public lazyLoading = true;

    @Input()
    public defaultDataConfigKey: keyof Settings;

    public get controlType(): string {
        return 'search-repo-selector';
    }

    private items: Selectable[];

    private modelSubscription: ModelSubscription;

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

    public onContainerClick(event: MouseEvent): void {
        if (!this.items) {
            this.doModelRequest().then(() => this.initItems());
        }
        super.onContainerClick(event);
    }

    public getFilteredItemsBySearchValue(): Selectable[] {
        if (!this.items) {
            return [];
        }
        const searchValue: string = this.searchValueForm.value.trim().toLowerCase();
        return this.items.filter(item => {
            const idString = '' + item.id;
            const foundId = idString.trim().toLowerCase().indexOf(searchValue) !== -1;

            if (foundId) {
                return true;
            }

            return item.toString().toLowerCase().indexOf(searchValue) > -1;
        });
    }

    private async init(): Promise<void> {
        if (this.repo && (!this.lazyLoading || this.defaultDataConfigKey || !this.empty)) {
            await this.doModelRequest();
            this.initItems();
        }
        if (this.defaultDataConfigKey) {
            this.subscriptions.push(
                this.meetingSettingService.get(this.defaultDataConfigKey).subscribe(value => {
                    if (!this.value) {
                        this.value = value as any;
                    }
                })
            );
        }
    }

    private async doModelRequest(): Promise<void> {
        this.cleanModelSubscription();
        this.modelSubscription = await this.modelRequestService.requestModels(
            this.repo.getRequestToGetAllModels(),
            this.constructor.name
        );
    }

    private initItems(): void {
        const observer = this.repo.getViewModelListObservable();
        this.subscriptions.push(
            observer.subscribe(items => {
                this.items = items || [];
            })
        );
    }

    private cleanModelSubscription(): void {
        if (this.modelSubscription) {
            this.modelSubscription.close();
            this.modelSubscription = null;
        }
    }
}
