import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Optional,
    Output,
    Self,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';

import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { ModelRequestRepository } from 'app/core/repositories/model-request-repository';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { Settings } from 'app/shared/models/event-management/meeting';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
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
    @ViewChild('matSelect')
    public matSelect: MatSelect;

    @ViewChild('chipPlaceholder', { static: false })
    public chipPlaceholder: ElementRef<HTMLElement>;

    @Input()
    public repo: BaseRepository<any, any> & ModelRequestRepository;

    @Input()
    public lazyLoading = true;

    @Input()
    public multiple = false;

    @Input()
    public includeNone = true;

    @Input()
    public noneTitle = '-';

    @Input()
    public showChips = true;

    @Input()
    public showNotFoundButton = true;

    @Input()
    public defaultDataConfigKey: keyof Settings;

    @Input()
    public errorStateMatcher: ParentErrorStateMatcher;

    @Output()
    public clickNotFound = new EventEmitter<string>();

    public get empty(): boolean {
        return Array.isArray(this.contentForm.value) ? !this.contentForm.value.length : !this.contentForm.value;
    }
    public get controlType(): string {
        return 'search-repo-selector';
    }
    public get selectedItems(): Selectable[] {
        return this.items && this.contentForm.value
            ? this.items.filter(item => this.contentForm.value.includes(item.id))
            : [];
    }

    public get width(): string {
        return this.chipPlaceholder ? `${this.chipPlaceholder.nativeElement.clientWidth - 16}px` : '100%';
    }

    public searchValueForm: FormControl;

    private items: Selectable[];

    private modelSubscription: ModelSubscription;

    public constructor(
        formBuilder: FormBuilder,
        @Optional() @Self() public ngControl: NgControl,
        focusMonitor: FocusMonitor,
        element: ElementRef<HTMLElement>,
        private componentServiceCollector: ComponentServiceCollector
    ) {
        super(formBuilder, focusMonitor, element, ngControl);
    }

    public ngOnInit(): void {
        if (this.repo && (!this.lazyLoading || this.defaultDataConfigKey)) {
            this.doModelRequest().then(() => this.initItems());
        }
        if (this.defaultDataConfigKey) {
            this.subscriptions.push(
                this.componentServiceCollector.meetingSettingService.get(this.defaultDataConfigKey).subscribe(value => {
                    if (!this.value) {
                        this.value = value as any;
                    }
                })
            );
        }
    }

    public onContainerClick(event: MouseEvent): void {
        if (!this.items) {
            this.doModelRequest().then(() => this.initItems());
        }
        this.matSelect.open();
    }

    /**
     * Emits the click on 'notFound' and resets the search-value.
     */
    public onNotFoundClick(): void {
        this.clickNotFound.emit(this.searchValueForm.value);
        this.searchValueForm.setValue('');
    }

    public removeItem(itemId: number): void {
        const items = <number[]>this.contentForm.value;
        items.splice(
            items.findIndex(item => item === itemId),
            1
        );
        this.contentForm.setValue(items);
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

    protected initializeForm(): void {
        this.contentForm = this.fb.control([]);
        this.searchValueForm = this.fb.control('');
    }

    protected updateForm(value: Selectable[]): void {
        this.contentForm.setValue(value);
    }

    private async doModelRequest(): Promise<void> {
        this.cleanModelSubscription();
        this.modelSubscription = await this.componentServiceCollector.modelRequestService.requestModels(
            this.repo.getRequestToGetAllModels()
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
