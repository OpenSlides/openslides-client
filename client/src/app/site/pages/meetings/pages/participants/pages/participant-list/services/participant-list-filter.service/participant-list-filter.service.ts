import { Injectable } from '@angular/core';
import { ParticipantListServiceModule } from '../participant-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { StorageService } from 'src/app/gateways/storage.service';
import { GroupControllerService } from '../../../../modules/groups/services/group-controller.service';
import { TranslateService } from '@ngx-translate/core';
import { DelegationType } from 'src/app/site/pages/meetings/view-models/delegation-type';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: ParticipantListServiceModule
})
export class ParticipantListFilterService extends BaseFilterListService<ViewUser> {
    /**
     * set the storage key name
     */
    protected storageKey = `UserList`;

    private userGroupFilterOptions: OsFilter<ViewUser> = {
        property: `group_ids`,
        label: `Groups`,
        options: []
    };

    /**
     * Constructor.
     * Subscribes to incoming group definitions.
     *
     * @param store
     * @param groupRepo to filter by groups
     * @param translate marking some translations that are unique here
     */
    public constructor(store: StorageService, groupRepo: GroupControllerService, private translate: TranslateService) {
        super();
        this.updateFilterForRepo({
            repo: groupRepo,
            filter: this.userGroupFilterOptions,
            filterFn: model => !model.isDefaultGroup
        });
    }

    /**
     * @returns the filter definition
     */
    protected getFilterDefinitions(): OsFilter<ViewUser>[] {
        const staticFilterOptions: OsFilter<ViewUser>[] = [
            {
                property: `isPresentInMeeting`,
                label: `Presence`,
                options: [
                    { condition: true, label: _(`Is present`) },
                    { condition: [false, null], label: _(`Is not present`) }
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
            {
                property: `isLastEmailSend`,
                label: _(`Last email send`),
                options: [
                    { condition: true, label: _(`Got an email`) },
                    { condition: [false, null], label: _(`Didn't get an email`) }
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
                property: `delegationType`,
                label: _(`Delegation of vote`),
                options: [
                    {
                        condition: DelegationType.Transferred,
                        label: _(`Voting right received from (principals)`)
                    },
                    {
                        condition: DelegationType.Received,
                        label: _(`Voting right delegated to (proxy)`)
                    },
                    {
                        condition: DelegationType.Neither,
                        label: _(`No delegation of vote`)
                    }
                ]
            }
        ];
        return staticFilterOptions.concat(this.userGroupFilterOptions);
    }
}
