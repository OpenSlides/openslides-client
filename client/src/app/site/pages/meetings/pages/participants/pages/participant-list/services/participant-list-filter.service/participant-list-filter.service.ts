import { Injectable } from '@angular/core';
import { ParticipantListServiceModule } from '../participant-list-service.module';
import { BaseFilterListService, OsFilter } from 'src/app/site/base/base-filter.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { StorageService } from 'src/app/gateways/storage.service';
import { GroupControllerService } from '../../../../modules/groups/services/group-controller.service';
import { TranslateService } from '@ngx-translate/core';
import { DelegationType } from 'src/app/site/pages/meetings/view-models/delegation-type';

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
                    { condition: true, label: this.translate.instant(`Is present`) },
                    { condition: false, label: this.translate.instant(`Is not present`) }
                ]
            },
            {
                property: `is_active`,
                label: this.translate.instant(`Active`),
                options: [
                    { condition: true, label: this.translate.instant(`Is active`) },
                    { condition: [false, null], label: this.translate.instant(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: this.translate.instant(`Committee`),
                options: [
                    { condition: true, label: this.translate.instant(`Is not a committee`) },
                    { condition: false, label: this.translate.instant(`Is a committee`) }
                ]
            },
            {
                property: `isLastEmailSend`,
                label: this.translate.instant(`Last email send`),
                options: [
                    { condition: true, label: this.translate.instant(`Got an email`) },
                    { condition: false, label: this.translate.instant(`Didn't get an email`) }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: this.translate.instant(`Vote weight`),
                options: [
                    { condition: false, label: this.translate.instant(`Has changed vote weight`) },
                    { condition: true, label: this.translate.instant(`Has unchanged vote weight`) }
                ]
            },
            {
                property: `delegationType`,
                label: this.translate.instant(`Delegation of vote`),
                options: [
                    {
                        condition: DelegationType.Transferred,
                        label: this.translate.instant(`Voting right received from (principals)`)
                    },
                    {
                        condition: DelegationType.Received,
                        label: this.translate.instant(`Voting right delegated to (proxy)`)
                    },
                    {
                        condition: DelegationType.Neither,
                        label: this.translate.instant(`No delegation of vote`)
                    }
                ]
            }
        ];
        return staticFilterOptions.concat(this.userGroupFilterOptions);
    }
}
