import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import { BaseSortListService, OsSortingDefinition, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { ParticipantListServiceModule } from '../participant-list-service.module';

@Injectable({
    providedIn: ParticipantListServiceModule
})
export class ParticipantListSortService extends BaseSortListService<ViewUser> {
    /**
     * set the storage key name
     */
    protected storageKey = `UserList`;

    /**
     * Define the sort options
     */
    private userSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `full_name`, label: `Full name` },
        { property: `first_name`, label: `Given name` },
        { property: `last_name`, label: `Surname` },
        { property: `is_present_in_meeting_ids`, label: `Presence` },
        { property: `is_active`, label: `Is active` },
        { property: `is_physical_person`, label: `Is a natural person` },
        { property: `number`, label: `Participant number` },
        { property: `structure_level`, label: `Structure level` },
        { property: `vote_weight`, label: `Vote weight` },
        { property: `comment` }
        // TODO email send?
    ];

    public constructor(translate: TranslateService, store: StorageService) {
        super(translate, store);
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.userSortOptions;
    }

    /**
     * Required by parent
     *
     * @returns the default sorting strategy
     */
    public async getDefaultDefinition(): Promise<OsSortingDefinition<ViewUser>> {
        return {
            sortProperty: `full_name`,
            sortAscending: true
        };
    }
}
