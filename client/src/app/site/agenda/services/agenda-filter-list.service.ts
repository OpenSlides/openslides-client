import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { BaseFilterListService, OsFilter, OsFilterOption } from 'app/core/ui-services/base-filter-list.service';
import { ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { Assignment } from 'app/shared/models/assignments/assignment';
import { Motion } from 'app/shared/models/motions/motion';
import { MotionBlock } from 'app/shared/models/motions/motion-block';
import { Topic } from 'app/shared/models/topics/topic';

import { ViewAgendaItem } from '../models/view-agenda-item';

/**
 * Filter the agenda list
 */
@Injectable({
    providedIn: `root`
})
export class AgendaFilterListService extends BaseFilterListService<ViewAgendaItem> {
    /**
     * set the storage key name
     */
    protected storageKey = `AgendaList`;

    public tagFilterOptions: OsFilter<ViewAgendaItem> = {
        property: `tag_ids`,
        label: `Tags`,
        options: []
    };

    /**
     * Constructor. Also creates the dynamic filter options
     *
     * @param store
     * @param translate Translation service
     */
    public constructor(
        store: StorageService,
        historyService: HistoryService,
        private translate: TranslateService,
        tagRepo: TagRepositoryService
    ) {
        super(store, historyService);

        this.updateFilterForRepo({
            repo: tagRepo,
            filter: this.tagFilterOptions,
            noneOptionLabel: this.translate.instant(`No tags`)
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewAgendaItem>[] {
        return [
            {
                label: `Status`,
                property: `closed`,
                options: [
                    { label: this.translate.instant(`Open items`), condition: false },
                    { label: this.translate.instant(`Closed items`), condition: true }
                ]
            },
            this.tagFilterOptions,
            {
                label: `Visibility`,
                property: `type`,
                options: this.createVisibilityFilterOptions()
            },
            {
                label: `Type`,
                property: `getContentObjectCollection`,
                options: [
                    { label: this.translate.instant(`Motions`), condition: Motion.COLLECTION },
                    { label: this.translate.instant(`Topics`), condition: Topic.COLLECTION },
                    { label: this.translate.instant(`Motion blocks`), condition: MotionBlock.COLLECTION },
                    { label: this.translate.instant(`Elections`), condition: Assignment.COLLECTION }
                ]
            }
        ];
    }

    /**
     * helper function to create options for visibility filters
     *
     * @returns a list of choices to filter from
     */
    private createVisibilityFilterOptions(): OsFilterOption[] {
        return ItemTypeChoices.map(choice => ({
            condition: choice.key,
            label: choice.name
        }));
    }
}
