import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { AccountCommonServiceModule } from './account-common-service.module';
import { OsFilter, BaseFilterListService, OsFilterOptions } from 'src/app/site/base/base-filter.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { CommitteeRepositoryService } from 'src/app/gateways/repositories/committee-repository.service';
import { StorageService } from 'src/app/gateways/storage.service';
import { HistoryService } from 'src/app/site/pages/meetings/pages/history/services/history.service';

@Injectable({
    providedIn: `root`
})
export class AccountFilterService extends BaseFilterListService<ViewUser> {
    protected storageKey = `MemberList`;

    private committeeFilterOptions: OsFilter<ViewUser> = {
        property: `committee_ids`,
        label: this.translate.instant(`Committees`),
        options: []
    };

    public constructor(
        committeeRepo: CommitteeRepositoryService,
        store: StorageService,
        history: HistoryService,
        private meetingRepo: MeetingControllerService,
        private translate: TranslateService
    ) {
        super(store, history);

        this.updateFilterForRepo({
            repo: committeeRepo,
            filter: this.committeeFilterOptions,
            noneOptionLabel: this.translate.instant(`No committee`)
        });
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
                    { condition: [false, null], label: this.translate.instant(`Is not active`) }
                ]
            },
            {
                property: `isLastEmailSend`,
                label: this.translate.instant(`Last email send`),
                options: [
                    { condition: true, label: this.translate.instant(`Got an email`) },
                    { condition: [false, null], label: this.translate.instant(`Didn't get an email`) }
                ]
            },
            {
                property: `isVoteWeightOne`,
                label: this.translate.instant(`Vote weight`),
                options: [
                    { condition: [false, null], label: this.translate.instant(`Has changed vote weight`) },
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
