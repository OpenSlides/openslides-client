import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { Motion } from 'app/shared/models/motions/motion';
import { OptionData, PollData } from 'app/shared/models/poll/generic-poll';
import { Poll } from 'app/shared/models/poll/poll';
import { PollMethod, PollPercentBase, PollType } from 'app/shared/models/poll/poll-constants';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';
import { PollService, PollTableData, VotingResult } from 'app/site/polls/services/poll.service';

/**
 * Service class for motion polls.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollService extends PollService {
    public defaultPercentBase: PollPercentBase;
    public defaultPollType: PollType;
    public defaultGroupIds: number[];

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: ParsePollNumberPipe,
        protected translate: TranslateService,
        private repo: PollRepositoryService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber);
        this.meetingSettingsService
            .get('motion_poll_default_100_percent_base')
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService.get('motion_poll_default_type').subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService.get('motion_poll_default_group_ids').subscribe(ids => (this.defaultGroupIds = ids));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant('Vote'),
            onehundred_percent_base: this.defaultPercentBase,
            entitled_group_ids: this.defaultGroupIds,
            type: this.isElectronicVotingEnabled ? this.defaultPollType : PollType.Analog,
            pollmethod: PollMethod.YNA
        };

        if (contentObject) {
            const length = this.repo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    public generateTableData(poll: PollData): PollTableData[] {
        let tableData: PollTableData[] = poll.options.flatMap(option =>
            super.getVoteTableKeys(poll).map(key => this.createTableDataEntry(poll, key, option))
        );
        tableData.push(...super.getSumTableKeys(poll).map(key => this.createTableDataEntry(poll, key)));

        tableData = tableData.filter(localeTableData => !localeTableData.value.some(result => result.hide));
        return tableData;
    }

    public showChart(poll: PollData): boolean {
        return poll && poll.options && poll.options.some(option => option.yes >= 0 && option.no >= 0);
    }

    private createTableDataEntry(poll: PollData, result: VotingResult, option?: OptionData): PollTableData {
        return {
            votingOption: result.vote,
            value: [
                {
                    amount: option ? option[result.vote] : poll[result.vote],
                    hide: result.hide,
                    icon: result.icon,
                    showPercent: result.showPercent
                }
            ]
        };
    }
}
