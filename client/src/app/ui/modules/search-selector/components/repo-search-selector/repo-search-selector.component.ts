import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, Input, OnInit, Optional, Self, ViewEncapsulation } from '@angular/core';
import { NgControl, UntypedFormBuilder } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { map, OperatorFunction } from 'rxjs';

import { Settings } from '../../../../../domain/models/meetings/meeting';
import { MeetingSettingsService } from '../../../../../site/pages/meetings/services/meeting-settings.service';
import { ViewModelListProvider } from '../../../../base/view-model-list-provider';
import { BaseSearchSelectorComponent } from '../base-search-selector/base-search-selector.component';

@Component({
    selector: `os-repo-search-selector`,
    templateUrl: `../base-search-selector/base-search-selector.component.html`,
    styleUrls: [`../base-search-selector/base-search-selector.component.scss`, `./repo-search-selector.component.scss`],
    providers: [{ provide: MatFormFieldControl, useExisting: RepoSearchSelectorComponent }],
    encapsulation: ViewEncapsulation.None
})
export class RepoSearchSelectorComponent extends BaseSearchSelectorComponent implements OnInit {
    @Input()
    public set repo(repo: ViewModelListProvider<any>) {
        this._repo = repo;
    }

    /**
     * Function to pipe view-models received from the observable of a view-model list.
     */
    @Input()
    public pipeFn: OperatorFunction<any, any> = map(items => items);

    @Input()
    public lazyLoading = true;

    @Input()
    public defaultDataConfigKey: keyof Settings | undefined;

    public get controlType(): string {
        return `repo-search-selector`;
    }

    private _repo!: ViewModelListProvider<any>;

    public constructor(
        formBuilder: UntypedFormBuilder,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        @Optional() @Self() ngControl: NgControl,
        private meetingSettingService: MeetingSettingsService
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
        this.shouldPropagateOnRegistering = false;
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.init();
    }

    private async init(): Promise<void> {
        this.initItems();
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

    private initItems(): void {
        const observer = this._repo!.getViewModelListObservable();
        this.subscriptions.push(
            observer.pipe(this.pipeFn).subscribe(items => {
                this.selectableItems = items || [];
            })
        );
    }
}
