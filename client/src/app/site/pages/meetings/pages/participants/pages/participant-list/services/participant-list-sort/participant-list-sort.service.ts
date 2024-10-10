import { Injectable, ProviderToken } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { BaseSortListService, OsHideSortingOptionSetting, OsSortingOption } from 'src/app/site/base/base-sort.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';

@Injectable({
    providedIn: `root`
})
export class ParticipantListSortService extends BaseSortListService<ViewUser> {
    /**
     * set the storage key name
     */
    protected storageKey = `UserList`;

    protected repositoryToken: ProviderToken<BaseRepository<any, any>> = UserRepositoryService;

    /**
     * Define the sort options
     */
    private userSortOptions: OsSortingOption<ViewUser>[] = [
        { property: `full_name`, label: _(`Full name`), baseKeys: [`first_name`, `last_name`, `title`] },
        { property: [`first_name`, `last_name`], label: _(`Given name`) },
        { property: [`last_name`, `first_name`], label: _(`Surname`) },
        { property: `is_present_in_meeting_ids`, label: _(`Presence`) },
        { property: `is_locked_out`, label: _(`Locked out`) },
        { property: `member_number`, label: _(`Membership number`) },
        { property: `gender_name`, label: _(`Gender`) },
        { property: `is_active`, label: _(`Is active`) },
        { property: `is_physical_person`, label: _(`Is a natural person`) },
        { property: `number`, label: _(`Participant number`), foreignBaseKeys: { meeting_user: [`number`] } },
        { property: `voteWeight`, label: _(`Vote weight`), foreignBaseKeys: { meeting_user: [`vote_weight`] } },
        { property: `comment`, baseKeys: [], foreignBaseKeys: { meeting_user: [`comment`] } },
        { property: `last_email_sent`, label: _(`Last email sent`) },
        { property: `hasEmail`, label: _(`Has email`) },
        { property: `last_login`, label: _(`Last login`) }
    ];

    private _voteWeightEnabled: boolean;

    public constructor(
        private meetingSettings: MeetingSettingsService,
        private operator: OperatorService
    ) {
        super({
            sortProperty: [`first_name`, `last_name`],
            sortAscending: true
        });
        this.meetingSettings.get(`users_enable_vote_weight`).subscribe(value => (this._voteWeightEnabled = value));
    }

    /**
     * @override
     */
    protected getSortOptions(): OsSortingOption<ViewUser>[] {
        return this.userSortOptions;
    }

    protected override getHideSortingOptionSettings(): OsHideSortingOptionSetting<ViewUser>[] {
        return [
            {
                property: `voteWeight`,
                shouldHideFn: () => !this._voteWeightEnabled
            },
            {
                property: `member_number`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanSeeSensitiveData)
            },
            {
                property: `hasEmail`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanSeeSensitiveData)
            },
            {
                property: `is_active`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanSeeSensitiveData)
            },
            {
                property: `last_email_sent`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanSeeSensitiveData)
            },
            {
                property: `last_login`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanUpdate)
            },
            {
                property: `is_locked_out`,
                shouldHideFn: () => !this.operator.hasPerms(Permission.userCanSeeSensitiveData)
            }
        ];
    }
}
