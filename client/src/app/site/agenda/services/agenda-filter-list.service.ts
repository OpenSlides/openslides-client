import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { OpenSlidesStatusService } from 'app/core/core-services/openslides-status.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { TagRepositoryService } from 'app/core/repositories/tags/tag-repository.service';
import { BaseFilterListService, OsFilter, OsFilterOption } from 'app/core/ui-services/base-filter-list.service';
import { ItemVisibilityChoices } from 'app/shared/models/agenda/agenda-item';
import { Motion } from 'app/shared/models/motions/motion';
import { ViewAgendaItem } from '../models/view-agenda-item';

/**
 * Filter the agenda list
 */
@Injectable({
    providedIn: 'root'
})
export class AgendaFilterListService extends BaseFilterListService<ViewAgendaItem> {
    /**
     * set the storage key name
     */
    protected storageKey = 'AgendaList';

    public tagFilterOptions: OsFilter = {
        property: 'tag_ids',
        label: 'Tags',
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
        OSStatus: OpenSlidesStatusService,
        private translate: TranslateService,
        tagRepo: TagRepositoryService
    ) {
        super(store, OSStatus);

        this.updateFilterForRepo(tagRepo, this.tagFilterOptions, this.translate.instant('No tags'));
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter[] {
        return [
            {
                label: 'Status',
                property: 'closed',
                options: [
                    { label: this.translate.instant('Open items'), condition: false },
                    { label: this.translate.instant('Closed items'), condition: true }
                ]
            },
            this.tagFilterOptions,
            {
                label: 'Visibility',
                property: 'type',
                options: this.createVisibilityFilterOptions()
            },
            {
                label: 'Type',
                property: 'collection',
                options: [
                    { label: this.translate.instant('Motions'), condition: Motion.COLLECTION },
                    { label: this.translate.instant('Topics'), condition: 'topics/topic' },
                    { label: this.translate.instant('Motion blocks'), condition: 'motions/motion-block' },
                    { label: this.translate.instant('Elections'), condition: 'assignments/assignment' }
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
        return ItemVisibilityChoices.map(choice => ({
            condition: choice.key as number,
            label: choice.name
        }));
    }
}
