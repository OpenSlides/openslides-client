import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlatNode } from 'src/app/infrastructure/definitions/tree';
import { ViewMotion, ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import {
    BaseSortTreeViewComponent,
    SortTreeFilterId,
    SortTreeFilterOption
} from 'src/app/ui/base/base-sort-tree-view-component';

import { MotionCategoryControllerService } from '../../../../modules/categories/services';
import { TagControllerService } from '../../../../modules/tags/services';
import { MotionControllerService } from '../../../../services/common/motion-controller.service';
import { MotionCsvExportService } from '../../../../services/export/motion-csv-export.service';
import { MotionPdfExportService } from '../../../../services/export/motion-pdf-export.service';

@Component({
    selector: `os-motion-call-list`,
    templateUrl: `./motion-call-list.component.html`,
    styleUrls: [`./motion-call-list.component.scss`]
})
export class MotionCallListComponent extends BaseSortTreeViewComponent<ViewMotion> implements OnInit {
    /**
     * All motions sorted first by weight, then by id.
     */
    public motionsObservable: Observable<ViewMotion[]>;

    /**
     * Holds all motions for the export.
     */
    private motions: ViewMotion[] = [];

    /**
     * Boolean to check if the tree has changed.
     */
    public override hasChanged = false;

    /**
     * A (dynamically updating) list of available and active filters by tag
     */
    public tagFilterOptions: SortTreeFilterOption[] = [];

    /**
     * The current amount of tag filters active
     */
    public activeTagFilterCount = 0;

    /**
     * A (dynamically updating) list of available and active filters by category
     */
    public categoryFilterOptions: SortTreeFilterOption[] = [];

    /**
     * The current amount of category filters active
     */
    public activeCatFilterCount = 0;

    /**
     * BehaviorSubject to get informed every time the tag filter changes.
     */
    protected activeTagFilters = new BehaviorSubject<SortTreeFilterId[]>([]);

    /**
     * BehaviourSubject to get informed every time the category filter changes.
     */
    protected activeCatFilters = new BehaviorSubject<SortTreeFilterId[]>([]);

    public constructor(
        protected override translate: TranslateService,
        private motionRepo: MotionControllerService,
        private motionCsvExport: MotionCsvExportService,
        private motionPdfExport: MotionPdfExportService,
        private tagRepo: TagControllerService,
        private categoryRepo: MotionCategoryControllerService
    ) {
        super();

        this.motionsObservable = this.motionRepo.getViewModelListObservable();
        this.motionsObservable.subscribe(motions => {
            // Sort motions and make a copy, so it will stay sorted.
            this.motions = motions.map(x => x).sort((a, b) => a.sort_weight - b.sort_weight);
        });
    }

    /**
     * Initializes filters and filter subscriptions
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.activeTagFilters.subscribe((value: SortTreeFilterId[]) => this.onSubscribedFilterChange(`tag`, value))
        );
        this.subscriptions.push(
            this.activeCatFilters.subscribe((value: SortTreeFilterId[]) =>
                this.onSubscribedFilterChange(`category`, value)
            )
        );
        this.subscriptions.push(
            this.tagRepo.getViewModelListObservable().subscribe(tags => {
                if (tags && tags.length) {
                    this.tagFilterOptions = tags.map(tag => ({
                        label: tag.name,
                        id: tag.id,
                        state:
                            this.tagFilterOptions &&
                            this.tagFilterOptions.some(tagfilter => tagfilter.id === tag.id && tagfilter.state === true)
                    }));
                    this.tagFilterOptions.push({
                        label: this.translate.instant(`No tags`),
                        id: 0,
                        state:
                            this.tagFilterOptions &&
                            this.tagFilterOptions.some(tagfilter => tagfilter.id === 0 && tagfilter.state === true)
                    });
                } else {
                    this.tagFilterOptions = [];
                }
            })
        );

        this.subscriptions.push(
            this.categoryRepo.getViewModelListObservable().subscribe(categories => {
                if (categories && categories.length) {
                    this.categoryFilterOptions = categories.map(cat => ({
                        label: cat.prefixedName,
                        id: cat.id,
                        state:
                            this.categoryFilterOptions &&
                            this.categoryFilterOptions.some(
                                catfilter => catfilter.id === cat.id && catfilter.state === true
                            )
                    }));
                    this.categoryFilterOptions.push({
                        label: this.translate.instant(`No category`),
                        id: 0,
                        state:
                            this.categoryFilterOptions &&
                            this.categoryFilterOptions.some(catfilter => catfilter.id === 0 && catfilter.state === true)
                    });
                } else {
                    this.categoryFilterOptions = [];
                }
            })
        );
    }

    // public getModelRequest(): SimplifiedModelRequest {
    //     return {
    //         viewModelCtor: ViewMeeting,
    //         ids: [this.activeMeetingId],
    //         follow: [
    //             {
    //                 idField: `motion_ids`,
    //                 fieldset: `callList`
    //             }
    //         ]
    //     };
    // }

    /**
     * Function to save changes on click.
     */
    public async onSave(): Promise<void> {
        await this.motionRepo
            .sortMotions(this.osSortTree!.getTreeData())
            .then(() => this.osSortTree!.setSubscription());
    }

    /**
     * Export the full call list as csv.
     */
    public csvExportCallList(): void {
        this.motionCsvExport.exportCallList(this.motions);
    }

    /**
     * Triggers a pdf export of the call list
     */
    public pdfExportCallList(): void {
        this.motionPdfExport.exportPdfCallList(this.motions);
    }

    /**
     * Get the tags associated with the motion of a sorting item
     *
     * @param item A FlatNode from a OsSortignTree
     * @returns An array of ViewTags (or an empty adrray)
     */
    public getTags(item: FlatNode<ViewMotion>): ViewTag[] {
        const motion = this.motionRepo.getViewModel(item.id);
        return motion ? motion.tags : [];
    }

    /**
     * Toggles a filter. An array with the filter ids array will be emitted
     * as active/model/Filters
     *
     * @param model either 'tag' or 'category' for the filter that changed
     * @param filter the filter that is supposed to be toggled.
     */
    public onFilterChange(model: 'tag' | 'category', filter: SortTreeFilterId): void {
        const value = model === `tag` ? this.activeTagFilters.value : this.activeCatFilters.value;
        if (!value.includes(filter)) {
            value.push(filter);
        } else {
            value.splice(value.indexOf(filter), 1);
        }
        if (model === `tag`) {
            this.activeTagFilters.next(value);
        } else {
            this.activeCatFilters.next(value);
        }
    }

    /**
     * Function to unset all active filters.
     */
    public resetFilters(): void {
        this.activeTagFilters.next([]);
        this.activeCatFilters.next([]);
    }

    /**
     * This method requires a confirmation from the user
     * and starts the sorting by the property `number` of the motions
     * in case of `true`.
     */
    public async sortMotionsByNumber(): Promise<void> {
        const title = this.translate.instant(`Do you really want to go ahead?`);
        const text = this.translate.instant(`This will reset all made changes and sort the call list.`);
        if (await this.promptService.open(title, text)) {
            this.forceSort.emit(`number`);
        }
    }

    /**
     * Helper to trigger an update of the filter itself and the information about
     * the state of filters
     *
     * @param model the property/model the filter is for
     * @param value
     */
    private onSubscribedFilterChange(model: 'tag' | 'category', value: SortTreeFilterId[]): void {
        if (model === `tag`) {
            this.activeTagFilterCount = value.length;
            this.tagFilterOptions.forEach(filterOption => {
                filterOption.state = value && value.some(v => v === filterOption.id);
            });
        } else {
            this.activeCatFilterCount = value.length;
            this.categoryFilterOptions.forEach(filterOption => {
                filterOption.state = value && value.some(v => v === filterOption.id);
            });
        }
        this.hasActiveFilter = this.activeCatFilterCount > 0 || this.activeTagFilterCount > 0;

        const currentTagFilters = this.tagFilterOptions.filter(option => option.state === true);
        const currentCategoryFilters = this.categoryFilterOptions.filter(option => option.state === true);
        this.changeFilter.emit(
            // TODO this is ugly and potentially reversed
            (item: ViewMotion): boolean => {
                if (currentTagFilters.length) {
                    if (!item.tags || !item.tags.length) {
                        if (!currentTagFilters.some(filter => filter.id === 0)) {
                            return true;
                        }
                    } else if (!item.tags.some(tag => currentTagFilters.some(filter => filter.id === tag.id))) {
                        return true;
                    }
                }
                if (currentCategoryFilters.length) {
                    const category_id = item.category_id || 0;
                    return !currentCategoryFilters.some(filter => filter.id === category_id);
                }
                return false;
            }
        );
    }
}
