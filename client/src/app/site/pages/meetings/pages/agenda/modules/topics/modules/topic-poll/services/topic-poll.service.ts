import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ABSTAIN_KEY,
    CalculablePollKey,
    NO_KEY,
    OptionData,
    Poll,
    PollBackendDurationType,
    PollData,
    PollMethod,
    PollPercentBase,
    PollTableData,
    PollType,
    VotingResult,
    YES_KEY
} from 'src/app/domain/models/poll';
import { Topic } from 'src/app/domain/models/topics/topic';
import { compareNumber } from 'src/app/infrastructure/utils';
import { ChartDate } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { PollKeyVerbosePipe, PollParseNumberPipe } from 'src/app/site/pages/meetings/modules/poll/pipes';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { PollServiceMapperService } from 'src/app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ThemeService } from 'src/app/site/services/theme.service';

import { ViewTopic } from '../../../view-models';
import { TopicPollServiceModule } from './topic-poll-service.module';

@Injectable({
    providedIn: TopicPollServiceModule
})
export class TopicPollService extends PollService {
    public defaultPollMethod: PollMethod;
    public defaultPercentBase: PollPercentBase;
    public defaultGroupIds: number[];
    public defaultPollType: PollType;

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: PollParseNumberPipe,
        pollServiceMapper: PollServiceMapperService,
        translate: TranslateService,
        private pollRepo: PollControllerService,
        private meetingSettingsService: MeetingSettingsService,
        themeService: ThemeService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber, themeService);
        pollServiceMapper.registerService(ViewTopic.COLLECTION, this);
        this.meetingSettingsService
            .get(`topic_poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base ?? PollPercentBase.Y));

        this.meetingSettingsService
            .get(`topic_poll_default_group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids ?? []));

        this.meetingSettingsService
            .get(`topic_poll_default_method`)
            .subscribe(method => (this.defaultPollMethod = method ?? PollMethod.Y));

        this.meetingSettingsService
            .get(`topic_poll_default_type`)
            .subscribe(type => (this.defaultPollType = type ?? PollType.Pseudoanonymous));

        this.meetingSettingsService
            .get(`topic_poll_sort_poll_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));

        this.meetingSettingsService
            .get(`topic_poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option));
    }

    public getDefaultPollData(contentObject?: Topic): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Vote`),
            onehundred_percent_base: this.defaultPercentBase,
            entitled_group_ids: this.defaultGroupIds,
            pollmethod: this.defaultPollMethod,
            type: this.defaultPollType,
            backend: PollBackendDurationType.FAST
        };

        if (contentObject) {
            const length = this.pollRepo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    public generateTableDataAsObservable(poll: PollData): Observable<PollTableData[]> {
        // The "of(...)"-observable is used to fire the current state the first time.
        return merge(of(poll.options), poll.options_as_observable).pipe(
            map(options => this.createTableData(poll, options))
        );
    }

    private createTableData(poll: PollData, options: OptionData[]): PollTableData[] {
        let tableData: PollTableData[] = options.flatMap(option =>
            super.getVoteTableKeys(poll).map(key => this.createTableDataEntry(poll, key, option))
        );
        tableData.push(...super.getSumTableKeys(poll).map(key => this.createTableDataEntry(poll, key)));

        tableData = tableData.filter(localeTableData => !localeTableData.value.some(result => result.hide));
        return tableData;
    }

    private createTableDataEntry(poll: PollData, result: VotingResult, option?: OptionData): PollTableData {
        return {
            votingOption: result.vote,
            votingOptionSubtitle: option ? option.getOptionTitle().title : ``,
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

    public shouldShowChart(poll: PollData): boolean {
        return (
            poll &&
            poll.options &&
            poll.options.some(option => option.yes >= 0 && option.no >= 0 && option.abstain >= 0)
        );
    }

    public getSortedChartLabels(poll: PollData): string[] {
        const data = this.getResultFromPoll(poll, YES_KEY);
        const labels = this.getChartLabels(poll, true);
        let labelsAndData = [];
        labels.forEach((value, index) => labelsAndData.push({ data: data[index], label: labels[index] }));
        labelsAndData = labelsAndData.sort((a: { data: number; label: string }, b: { data: number; label: string }) =>
            compareNumber(a.data, b.data)
        );
        const sortedLabels = [];
        labelsAndData.forEach(value => {
            sortedLabels.push(value.label);
        });
        return sortedLabels;
    }

    public override generateChartData(poll: PollData): ChartDate[] {
        const fields = this.getPollDataFields(poll);

        const data: ChartDate[] = fields.map(
            key =>
                ({
                    data: this.getResultFromPoll(poll, key).sort((a, b) => compareNumber(a, b)),
                    label: key.toUpperCase(),
                    backgroundColor: this.themeService.getPollColor(key),
                    hoverBackgroundColor: this.themeService.getPollColor(key),
                    barThickness: 20,
                    maxBarThickness: 20
                } as ChartDate)
        );

        return data;
    }

    /**
     * Extracts yes-no-abstain such as valid, invalids and totals from Poll and PollData-Objects
     */
    protected override getResultFromPoll(poll: PollData, key: CalculablePollKey): number[] {
        return [...poll.options].map(option => (option ? option[key] : undefined));
    }

    protected override getPollDataFields(poll: PollData): CalculablePollKey[] {
        const keys = [];
        switch (poll.pollmethod) {
            case PollMethod.YNA: {
                keys.push(...[YES_KEY, NO_KEY, ABSTAIN_KEY]);
                break;
            }
            case PollMethod.YN: {
                keys.push(...[YES_KEY, NO_KEY]);
                break;
            }
            case PollMethod.N: {
                keys.push(NO_KEY);
                break;
            }
            default: {
                keys.push(YES_KEY);
            }
        }
        return keys;
    }

    protected override getPercentBase(poll: PollData, row?: OptionData): number {
        const base = poll.onehundred_percent_base as PollPercentBase;
        switch (base) {
            case PollPercentBase.Y:
                return this.getSumOptionsY(poll);
            default:
                return super.getPercentBase(poll, row);
        }
    }

    private getSumOptionsY(poll: PollData): number {
        if (!poll.options?.length) {
            return 0;
        }
        return poll.votesvalid;
    }
}
