import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { AccountCommonServiceModule } from './account-common-service.module';
import { OsFilter, BaseFilterListService, OsFilterOptions } from 'src/app/site/base/base-filter.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { CommitteeRepositoryService } from 'src/app/gateways/repositories/committee-repository.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: `root`
})
export class AccountFilterService extends BaseFilterListService<ViewUser> {
    protected storageKey = `MemberList`;

    private committeeFilterOptions: OsFilter<ViewUser> = {
        property: `committee_ids`,
        label: _(`Committees`),
        options: []
    };

    public constructor(
        private meetingRepo: MeetingControllerService,
        committeeRepo: CommitteeRepositoryService,
        private translate: TranslateService
    ) {
        super();

        this.updateFilterForRepo({
            repo: committeeRepo,
            filter: this.committeeFilterOptions,
            noneOptionLabel: _(`No committee`)
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
                label: _(`No meeting`)
            }
        ];
        const staticFilterDefinitions: OsFilter<ViewUser>[] = [
            {
                property: `is_active`,
                label: _(`Active`),
                options: [
                    { condition: true, label: `Is active` },
                    { condition: [false, null], label: _(`Is not active`) }
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
                property: `id`,
                label: _(`Meetings`),
                options: meetingFilterOptions
            },
            this.committeeFilterOptions
        ];
        return staticFilterDefinitions;
    }
}
