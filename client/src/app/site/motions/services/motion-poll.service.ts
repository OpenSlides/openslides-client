import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { Motion } from 'app/shared/models/motions/motion';
import { Poll } from 'app/shared/models/poll/poll';
import { MajorityMethod, PollMethod, PollPercentBase, PollType } from 'app/shared/models/poll/poll-constants';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';
import {
    BasePollData,
    CalculablePollKey,
    PollData,
    PollService,
    PollTableData,
    VotingResult
} from 'app/site/polls/services/poll.service';
import { ViewMotion } from '../models/view-motion';

interface PollResultData {
    yes?: number;
    no?: number;
    abstain?: number;
}

/**
 * Service class for motion polls.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollService extends PollService {
    /**
     * The default percentage base
     */
    public defaultPercentBase: PollPercentBase;

    /**
     * The default majority method
     */
    public defaultMajorityMethod: MajorityMethod;

    public defaultGroupIds: number[];

    public defaultPollType: PollType;

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
        this.meetingSettingsService
            .get('motion_poll_default_majority_method')
            .subscribe(method => (this.defaultMajorityMethod = method));
        this.meetingSettingsService.get('motion_poll_default_type').subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService.get('motion_poll_default_group_ids').subscribe(ids => (this.defaultGroupIds = ids));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<Poll> {
        const poll = super.getDefaultPollData();

        poll.title = this.translate.instant('Vote');
        poll.pollmethod = PollMethod.YNA;

        if (contentObject) {
            const length = this.repo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    public generateTableData(poll: ViewPoll<ViewMotion> | PollData): PollTableData[] {
        if (poll instanceof ViewPoll) {
            let tableData: PollTableData[] = poll.options.flatMap(vote =>
                super.getVoteTableKeys(poll).map(key => this.createTableDataEntry(poll, key, vote))
            );
            tableData.push(...super.getSumTableKeys(poll).map(key => this.createTableDataEntry(poll, key)));

            tableData = tableData.filter(localeTableData => !localeTableData.value.some(result => result.hide));
            return tableData;
        } else {
            return [];
        }
    }

    public showChart(poll: PollData): boolean {
        return poll && poll.options && poll.options.some(option => option.yes >= 0 && option.no >= 0);
    }

    public getPercentBase(poll: PollData): number {
        const base: PollPercentBase = poll.onehundred_percent_base as PollPercentBase;

        let totalByBase: number;
        const result = poll.options[0];
        switch (base) {
            case PollPercentBase.YN:
                if (result.yes >= 0 && result.no >= 0) {
                    totalByBase = this.sumYN(result);
                }
                break;
            case PollPercentBase.YNA:
                if (result.yes >= 0 && result.no >= 0 && result.abstain >= 0) {
                    totalByBase = this.sumYNA(result);
                }
                break;
            case PollPercentBase.Valid:
                // auslagern
                if (result.yes >= 0 && result.no >= 0 && result.abstain >= 0) {
                    totalByBase = poll.votesvalid;
                }
                break;
            case PollPercentBase.Cast:
                totalByBase = poll.votescast;
                break;
            case PollPercentBase.Entitled:
                totalByBase = poll.entitled_users_at_stop.length;
                break;
            case PollPercentBase.Disabled:
                break;
            default:
                throw new Error('The given poll has no percent base: ' + poll);
        }

        return totalByBase;
    }

    protected getResultFromPoll(poll: PollData, key: CalculablePollKey): number[] {
        return poll.options.map(option => option[key]);
    }

    private createTableDataEntry(poll: BasePollData<any, any>, result: VotingResult, vote?: ViewOption): PollTableData {
        return {
            votingOption: result.vote,
            value: [
                {
                    amount: vote ? vote[result.vote] : poll[result.vote],
                    hide: result.hide,
                    icon: result.icon,
                    showPercent: result.showPercent
                }
            ]
        };
    }

    private sumYN(result: PollResultData): number {
        let sum = 0;
        sum += result.yes > 0 ? result.yes : 0;
        sum += result.no > 0 ? result.no : 0;
        return sum;
    }

    private sumYNA(result: PollResultData): number {
        let sum = this.sumYN(result);
        sum += result.abstain > 0 ? result.abstain : 0;
        return sum;
    }
}
