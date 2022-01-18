import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { BaseFilterListService, OsFilter } from 'app/core/ui-services/base-filter-list.service';

import { DelegationType, ViewUser } from '../models/view-user';

/**
 * Filter the user list
 */
@Injectable({
    providedIn: `root`
})
export class UserFilterListService extends BaseFilterListService<ViewUser> {
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
    public constructor(
        store: StorageService,
        historyService: HistoryService,
        groupRepo: GroupRepositoryService,
        private translate: TranslateService
    ) {
        super(store, historyService);
        this.updateFilterForRepo({
            repo: groupRepo,
            filter: this.userGroupFilterOptions,
            filterFn: (model: ViewUser) => model.id !== 1
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
                    { condition: true, label: `Is active` },
                    { condition: false, label: this.translate.instant(`Is not active`) }
                ]
            },
            {
                property: `is_physical_person`,
                label: this.translate.instant(`Committee`),
                options: [
                    { condition: true, label: this.translate.instant(`Is not a committee`) },
                    { condition: false, label: `Is a committee` }
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
