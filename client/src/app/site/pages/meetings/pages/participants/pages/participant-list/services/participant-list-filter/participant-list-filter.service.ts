import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { Permission } from 'src/app/domain/definitions/permission';
import { OsFilter, OsHideFilterSetting } from 'src/app/site/base/base-filter.service';
import { BaseMeetingFilterListService } from 'src/app/site/pages/meetings/base/base-meeting-filter-list.service';
import { MeetingActiveFiltersService } from 'src/app/site/pages/meetings/services/meeting-active-filters.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { DelegationType } from 'src/app/site/pages/meetings/view-models/delegation-type';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { GenderControllerService } from 'src/app/site/pages/organization/pages/accounts/pages/gender/services/gender-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { GroupControllerService } from '../../../../modules/groups/services/group-controller.service';
import { StructureLevelControllerService } from '../../../structure-levels/services/structure-level-controller.service';
import { ParticipantListServiceModule } from '../participant-list-service.module';

@Injectable({
    providedIn: ParticipantListServiceModule
})
export class ParticipantListFilterService extends BaseMeetingFilterListService<ViewUser> {
    /**
     * set the storage key name
     */
    protected storageKey = `UserList`;

    private userGroupFilterOptions: OsFilter<ViewUser> = {
        property: `group_ids`,
        label: `Groups`,
        options: []
    };

    private userStructureLevelFilterOptions: OsFilter<ViewUser> = {
        property: `structure_level_ids`,
        label: `Structure level`,
        options: []
    };

    private genderFilterOption: OsFilter<ViewUser> = {
        property: `gender_id`,
        label: _(`Gender`),
        options: []
    };

    private _voteWeightEnabled: boolean;
    private _voteDelegationEnabled: boolean;

    public constructor(
        store: MeetingActiveFiltersService,
        groupRepo: GroupControllerService,
        structureRepo: StructureLevelControllerService,
        genderRepo: GenderControllerService,
        private meetingSettings: MeetingSettingsService,
        private operator: OperatorService
    ) {
        super(store);
        this.updateFilterForRepo({
            repo: groupRepo,
            filter: this.userGroupFilterOptions
        });
        this.updateFilterForRepo({
            repo: structureRepo,
            filter: this.userStructureLevelFilterOptions
        });
        this.updateFilterForRepo({
            repo: genderRepo,
            filter: this.genderFilterOption,
            noneOptionLabel: _(`not specified`)
        });
        this.meetingSettings.get(`users_enable_vote_weight`).subscribe(value => (this._voteWeightEnabled = value));
        this.meetingSettings
            .get(`users_enable_vote_delegations`)
            .subscribe(value => (this._voteDelegationEnabled = value));
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewUser>[] {
        const staticFilterOptions: OsFilter<ViewUser>[] = [
            {
                property: `isPresentInMeeting`,
                label: _(`Presence`),
                options: [
                    { condition: true, label: _(`Is present`) },
                    { condition: [false, null], label: _(`Is not present`) }
                ]
            },
            this.userGroupFilterOptions,
            this.userStructureLevelFilterOptions,
            {
                property: `delegationType`,
                label: _(`Delegation of vote`),
                options: [
                    {
                        condition: DelegationType.Transferred,
                        label: _(`Principals`)
                    },
                    {
                        condition: DelegationType.Received,
                        label: _(`Proxy holders`)
                    },
                    {
                        condition: DelegationType.Neither,
                        label: _(`No delegation of vote`)
                    }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: _(`Vote weight`),
                options: [
                    { condition: [false, null], label: _(`Has changed vote weight`) },
                    { condition: true, label: _(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `isLockedOutOfMeeting`,
                label: `Locked out`,
                options: [
                    { condition: true, label: `Is locked out` },
                    { condition: [false, null], label: `Is not locked out` }
                ]
            },
            {
                property: `is_active`,
                label: _(`Active`),
                options: [
                    { condition: true, label: _(`Is active`) },
                    { condition: [false, null], label: _(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: _(`Committee`),
                options: [
                    { condition: true, label: _(`Is not a committee`) },
                    { condition: [false, null], label: _(`Is a committee`) }
                ]
            },
            this.genderFilterOption,
            {
                property: `hasMemberNumber`,
                label: _(`Membership number`),
                options: [
                    { condition: true, label: _(`Has a membership number`) },
                    { condition: [false, null], label: _(`Has no membership number`) }
                ]
            },
            {
                property: `isLastLogin`,
                label: _(`Last login`),
                options: [
                    { condition: true, label: _(`Has logged in`) },
                    { condition: [false, null], label: _(`Has not logged in yet`) }
                ]
            },
            {
                property: `isLastEmailSent`,
                label: _(`Last email sent`),
                options: [
                    { condition: true, label: _(`Got an email`) },
                    { condition: [false, null], label: _(`Didn't get an email`) }
                ]
            },
            {
                property: `hasEmail`,
                label: _(`Email address`),
                options: [
                    { condition: true, label: _(`Has an email address`) },
                    { condition: [false, null], label: _(`Has no email address`) }
                ]
            },
            {
                property: `hasSamlId`,
                label: _(`SSO`),
                options: [
                    { condition: true, label: _(`Has SSO identification`) },
                    { condition: [false, null], label: _(`Has no SSO identification`) }
                ]
            }
        ];
        return staticFilterOptions;
    }

    protected override getHideFilterSettings(): OsHideFilterSetting<ViewUser>[] {
        return [
            {
                property: `isVoteWeightOne`,
                shouldHideFn: (): boolean => {
                    return !this._voteWeightEnabled;
                }
            },
            {
                property: `delegationType`,
                shouldHideFn: (): boolean => {
                    return !this._voteDelegationEnabled;
                }
            },
            {
                property: `is_active`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanSeeSensitiveData);
                }
            },
            {
                property: `hasSamlId`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanSeeSensitiveData);
                }
            },
            {
                property: `hasEmail`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanSeeSensitiveData);
                }
            },
            {
                property: `hasMemberNumber`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanSeeSensitiveData);
                }
            },
            {
                property: `isLastEmailSent`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanSeeSensitiveData);
                }
            },
            {
                property: `isLastLogin`,
                shouldHideFn: (): boolean => {
                    return !this.operator.hasPerms(Permission.userCanUpdate);
                }
            }
        ];
    }
}
