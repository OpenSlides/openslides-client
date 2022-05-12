import { Injectable } from '@angular/core';
import { OsFilter, BaseFilterListService, OsFilterOption } from 'src/app/site/base/base-filter.service';
import { AgendaItemListServiceModule } from '../agenda-item-list-service.module';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda/view-models';
import { StorageService } from 'src/app/gateways/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { TagControllerService } from '../../../../../motions/modules/tags/services/tag-controller.service/tag-controller.service';
import { Motion } from 'src/app/domain/models/motions/motion';
import { Topic } from 'src/app/domain/models/topics/topic';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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
    public constructor(store: StorageService, private translate: TranslateService, tagRepo: TagControllerService) {
        super();

        this.updateFilterForRepo({
            repo: tagRepo,
            filter: this.tagFilterOptions,
            noneOptionLabel: _(`No tags`)
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
                    { label: _(`Open items`), condition: false },
                    { label: _(`Closed items`), condition: true }
                ]
            },
            this.tagFilterOptions,
            {
                label: `Visibility`,
                property: `type`,
                options: this.createVisibilityFilterOptions()
            },
            {
                label: _(`Type`),
                property: `getContentObjectCollection`,
                options: [
                    { label: _(`Motions`), condition: Motion.COLLECTION },
                    { label: _(`Topics`), condition: Topic.COLLECTION },
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
