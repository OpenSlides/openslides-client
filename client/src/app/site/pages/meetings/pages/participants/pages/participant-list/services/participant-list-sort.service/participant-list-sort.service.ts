import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/gateways/storage.service';
import {
    BaseSortListService,
    OsHideSortingOptionSetting,
    OsSortingDefinition,
    OsSortingOption
} from 'src/app/site/base/base-sort.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
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
        { property: `full_name`, label: _(`Full name`) },
        { property: [`first_name`, `last_name`], label: _(`Given name`) },
        { property: [`last_name`, `first_name`], label: _(`Surname`) },
        { property: `is_present_in_meeting_ids`, label: _(`Presence`) },
        { property: `is_active`, label: _(`Is active`) },
        { property: `is_physical_person`, label: _(`Is a natural person`) },
        { property: `number`, label: _(`Participant number`) },
        { property: `structure_level`, label: _(`Structure level`) },
        { property: `voteWeight`, label: _(`Vote weight`) },
        { property: `comment` },
        { property: `last_email_sent`, label: _(`Last email sent`) },
        { property: `last_login`, label: _(`Last login`) }
    ];

    private _voteWeightEnabled: boolean;

    public constructor(
        translate: TranslateService,
        store: StorageService,
        private meetingSettings: MeetingSettingsService
    ) {
        super(translate, store);
        this.meetingSettings.get(`users_enable_vote_weight`).subscribe(value => (this._voteWeightEnabled = value));
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
            sortProperty: [`first_name`, `last_name`],
            sortAscending: true
        };
    }

    protected override getHideSortingOptionSettings(): OsHideSortingOptionSetting<ViewUser>[] {
        return [
            {
                property: `vote_weight`,
                shouldHideFn: () => !this._voteWeightEnabled
            }
        ];
    }
}
