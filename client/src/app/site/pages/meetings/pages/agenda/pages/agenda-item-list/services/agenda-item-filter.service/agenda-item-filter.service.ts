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
                label: this.translate.instant(`Type`),
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
