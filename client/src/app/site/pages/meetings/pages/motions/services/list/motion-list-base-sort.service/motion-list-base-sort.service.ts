import { Directive, inject, ProviderToken } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import {
    BaseSortListService,
    OsSortingDefinition,
    OsSortingOption,
    OsSortProperty
} from 'src/app/site/base/base-sort.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { ViewMotion } from '../../../view-models';

@Directive()
export class MotionListBaseSortService extends BaseSortListService<ViewMotion> {
    /**
     * set the storage key name
     */
    protected storageKey = `MotionList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = MotionRepositoryService;

    /**
     * Hold the default motion sorting
     */
    private defaultMotionSorting: string;

    /**
     * Define the sort options
     */
    protected motionSortOptions: OsSortingOption<ViewMotion>[] = [
        { property: `tree_weight`, label: `Call list`, baseKeys: [`sort_weight`, `sort_parent_id`] },
        { property: `number` },
        { property: `title` },
        {
            property: `submitters`,
            foreignBaseKeys: {
                user: [`username`, `first_name`, `last_name`],
                meeting_user: [`structure_level`]
            }
        },
        {
            property: `category`,
            sortFn: this.categorySortFn,
            baseKeys: [`category_id`, `category_weight`],
            foreignBaseKeys: { category: [`parent_id`, `weight`] }
        },
        { property: `block_id`, label: `Motion block` },
        { property: `state`, baseKeys: [`state_id`], foreignBaseKeys: { motion_state: [`name`] } },
        { property: `created`, label: _(`Creation date`) },
        { property: `sequential_number`, label: _(`Sequential number`) },
        { property: `last_modified`, label: _(`Last modified`) }
    ];

    private defaultDefinitionSubject: BehaviorSubject<OsSortingDefinition<ViewMotion>>;

    private meetingSettingsService = inject(MeetingSettingsService);

    /**
     * Constructor.
     */
    public constructor(
        defaultDefinition?: OsSortingDefinition<ViewMotion> | Observable<OsSortingDefinition<ViewMotion>>
    ) {
        const defaultDefinitions = new BehaviorSubject<OsSortingDefinition<ViewMotion>>(null);
        super(defaultDefinition ?? defaultDefinitions);
        this.defaultDefinitionSubject = defaultDefinitions;

        this.defaultMotionSorting = `number`;
        this.defaultDefinitionSubject.next({
            sortProperty: this.getDefaultSortProperty(),
            sortAscending: true
        });

        this.meetingSettingsService.get(`motions_default_sorting`).subscribe(defSortProp => {
            if (defSortProp) {
                this.defaultMotionSorting = defSortProp;
                this.defaultDefinitionSubject.next({
                    sortProperty: this.getDefaultSortProperty(),
                    sortAscending: true
                });
            }
        });
    }

    protected getSortOptions(): OsSortingOption<ViewMotion>[] {
        return this.motionSortOptions;
    }

    private getDefaultSortProperty(): OsSortProperty<ViewMotion> {
        if (this.defaultMotionSorting === `weight`) {
            return `tree_weight`;
        } else {
            return this.defaultMotionSorting as keyof ViewMotion;
        }
    }

    /**
     * Custom function to sort the categories by the `category_weight` of the motion.
     *
     * @param itemA The first item to sort
     * @param itemB The second item to sort
     * @param ascending If the sorting should be in ascended or descended order
     *
     * @returns {number} The result of comparing.
     */
    private categorySortFn(itemA: ViewMotion, itemB: ViewMotion, ascending: boolean): number {
        let result;
        if (itemA.category_id === itemB.category_id) {
            result = itemA.category_weight - itemB.category_weight;
        } else {
            // Traverse the category trees downwards and stop when they first diverge,
            const categoriesA = itemA.category.allParents.reverse().concat(itemA.category);
            const categoriesB = itemB.category.allParents.reverse().concat(itemB.category);
            let i = 0;
            while (categoriesA[i] && categoriesB[i] && categoriesA[i] == categoriesB[i]) {
                ++i;
            }
            // if either list is exhausted, the related item belongs to a supercategory of the other
            if (!categoriesA[i]) {
                result = -1;
            } else if (!categoriesB[i]) {
                result = 1;
            } else {
                // otherwise, compare the diverging categories by weight since they have the same parent
                result = categoriesA[i].weight - categoriesB[i].weight;
            }
        }
        return ascending ? result : -result;
    }
}
