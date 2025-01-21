import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { Motion } from 'src/app/domain/models/motions/motion';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseFilterListService, OsFilter, OsFilterOption } from 'src/app/site/base/base-filter.service';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { ActiveFiltersService } from 'src/app/site/services/active-filters.service';

import { TagControllerService } from '../../../../../motions/modules/tags/services/tag-controller.service/tag-controller.service';
import { AgendaItemListServiceModule } from '../agenda-item-list-service.module';

@Injectable({
    providedIn: AgendaItemListServiceModule
})
export class AgendaItemFilterService extends BaseFilterListService<ViewAgendaItem> {
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
        store: ActiveFiltersService,
        private translate: TranslateService,
        tagRepo: TagControllerService
    ) {
        super(store);

        this.updateFilterForRepo({
            repo: tagRepo,
            filter: this.tagFilterOptions,
            noneOptionLabel: _(`not specified`)
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewAgendaItem>[] {
        return [
            {
                label: _(`Status`),
                property: `closed`,
                options: [
                    { label: _(`Open items`), condition: [false, null] },
                    { label: _(`Closed items`), condition: true }
                ]
            },
            this.tagFilterOptions,
            {
                label: _(`Visibility`),
                property: `type`,
                options: this.createVisibilityFilterOptions()
            },
            {
                label: _(`Module`),
                property: `getContentObjectCollection`,
                options: [
                    { label: _(`Topics`), condition: Topic.COLLECTION },
                    { label: _(`Motions`), condition: Motion.COLLECTION },
                    { label: _(`Motion blocks`), condition: MotionBlock.COLLECTION },
                    { label: _(`Elections`), condition: Assignment.COLLECTION }
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
