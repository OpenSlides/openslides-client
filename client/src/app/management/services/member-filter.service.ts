import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/core/core-services/history.service';
import { StorageService } from 'app/core/core-services/storage.service';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { BaseFilterListService, OsFilter } from 'app/core/ui-services/base-filter-list.service';
import { ViewUser } from 'app/site/users/models/view-user';

import { OsFilterOptions } from '../../core/ui-services/base-filter-list.service';

@Injectable({
    providedIn: `root`
})
export class MemberFilterService extends BaseFilterListService<ViewUser> {
    protected storageKey = `MemberList`;

    private committeeFilterOptions: OsFilter<ViewUser> = {
        property: `committee_ids`,
        label: this.translate.instant(`Committees`),
        options: []
    };

    public constructor(
        store: StorageService,
        historyService: HistoryService,
        private meetingRepo: MeetingRepositoryService,
        committeeRepo: CommitteeRepositoryService,
        private translate: TranslateService
    ) {
        super(store, historyService);

        this.updateFilterForRepo(committeeRepo, this.committeeFilterOptions, this.translate.instant(`No committee`));
    }

    protected getFilterDefinitions(): OsFilter<ViewUser>[] {
        const meetingFilterOptions: OsFilterOptions = [
            ...this.meetingRepo.getViewModelList().map(meeting => ({
                condition: meeting.user_ids,
                label: meeting.name
            })),
            `-`,
            {
                condition: null,
                label: this.translate.instant(`No meeting`)
            }
        ];
        const staticFilterDefinitions: OsFilter<ViewUser>[] = [
            {
                property: `is_active`,
                label: this.translate.instant(`Active`),
                options: [
                    { condition: true, label: `Is active` },
                    { condition: false, label: this.translate.instant(`Is not active`) }
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
                property: `id`,
                label: this.translate.instant(`Meetings`),
                options: meetingFilterOptions
            },
            this.committeeFilterOptions
        ];
        return staticFilterDefinitions;
    }
}
