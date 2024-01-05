import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, merge, Observable, of } from 'rxjs';
import { Motion } from 'src/app/domain/models/motions/motion';
import { OptionData, OptionDataKey, PollData, PollDataKey } from 'src/app/domain/models/poll/generic-poll';
import { Poll } from 'src/app/domain/models/poll/poll';
import {
    ABSTAIN_KEY,
    CalculablePollKey,
    INVALID_VOTES_KEY,
    NO_KEY,
    PollMethod,
    PollPercentBase,
    PollTableData,
    PollType,
    VOTE_MAJORITY,
    VotingResult,
    YES_KEY
} from 'src/app/domain/models/poll/poll-constants';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service/poll.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';

import { MotionPollControllerService } from '../motion-poll-controller.service';
import { MotionPollServiceModule } from '../motion-poll-service.module';

export interface TableDataEntryCreationInput {
    poll: PollData;
    result: VotingResult;
    option?: OptionData;
    showPercent?: boolean;
}

/**
 * Service class for motion polls.
 */
@Injectable({
    providedIn: MotionPollServiceModule
})
export class MotionPollService extends PollService {
    public defaultPercentBase!: PollPercentBase;
    public defaultPollType!: PollType;
    public defaultGroupIds!: number[];

    protected override translate = inject(TranslateService);
    private repo = inject(MotionPollControllerService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public constructor(organizationSettingsService: OrganizationSettingsService) {
        super(organizationSettingsService);

        this.meetingSettingsService
            .get(`motion_poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService.get(`motion_poll_default_type`).subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService.get(`motion_poll_default_group_ids`).subscribe(ids => (this.defaultGroupIds = ids));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Vote`),
            onehundred_percent_base: this.defaultPercentBase,
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
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

    public generateTableDataAsObservable(poll: PollData): Observable<PollTableData[]> {
        // The "of(...)"-observable is used to fire the current state the first time.
        return merge(of(poll?.options), poll.options_as_observable).pipe(
            map(options => this.createTableData(poll, options))
        );
    }

    public override generateTableData(poll: PollData): PollTableData[] {
        return this.createTableData(poll, poll.options);
    }

    public shouldShowChart(poll: PollData | null): boolean {
        return (
            !!poll &&
            poll.options &&
            poll.options.some(option => option.yes! >= 0 || option.no! >= 0 || option.abstain! >= 0)
        );
    }

    protected override getPollDataFields(poll: PollData): CalculablePollKey[] {
        switch (poll?.onehundred_percent_base) {
            case PollPercentBase.YN:
                return [YES_KEY, NO_KEY];
            case PollPercentBase.Cast:
                return [YES_KEY, NO_KEY, ABSTAIN_KEY, INVALID_VOTES_KEY];
            default:
                return [YES_KEY, NO_KEY, ABSTAIN_KEY];
        }
    }

    private createTableData(poll: PollData, options: OptionData[]): PollTableData[] {
        const showPercent = !super
            .getVoteTableKeys(poll)
            .some(key => options.some(option => option[key.vote as OptionDataKey] === VOTE_MAJORITY));
        let tableData: PollTableData[] = options.flatMap(option =>
            super
                .getVoteTableKeys(poll)
                .map(key =>
                    this.createTableDataEntry({ poll: poll, result: key, option: option, showPercent: showPercent })
                )
        );
        tableData.push(
            ...super.getSumTableKeys(poll).map(key => this.createTableDataEntry({ poll: poll, result: key }))
        );

        tableData = tableData.filter(localeTableData => !localeTableData.value.some(result => result.hide));
        return tableData;
    }

    private createTableDataEntry(data: TableDataEntryCreationInput): PollTableData {
        return {
            votingOption: data.result.vote || ``,
            value: [
                {
                    amount: (data.option
                        ? data.option[data.result.vote as OptionDataKey]
                        : data.poll[data.result.vote as PollDataKey]) as number,
                    hide: data.result.hide,
                    icon: data.result.icon,
                    showPercent: this.calculateShowPercent(
                        data.poll,
                        data.option ? (data.result.vote as OptionDataKey) : (data.result.vote as PollDataKey),
                        data.showPercent ?? data.result.showPercent
                    )
                }
            ]
        };
    }

    private calculateShowPercent(
        poll: PollData,
        votingOption: OptionDataKey | PollDataKey,
        pollShowPercent: boolean
    ): boolean {
        const option = [`yes`, `no`, `abstain`].includes(votingOption) ? votingOption.charAt(0).toUpperCase() : null;
        if (!option || !poll.onehundred_percent_base) {
            return pollShowPercent;
        }
        return poll.onehundred_percent_base.indexOf(option) !== -1 ? pollShowPercent : false;
    }
}
