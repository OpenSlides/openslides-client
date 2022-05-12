import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollKeyVerbosePipe, PollParseNumberPipe } from 'src/app/site/pages/meetings/modules/poll/pipes';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { Motion } from 'src/app/domain/models/motions/motion';
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
    VotingResult,
    YES_KEY
} from 'src/app/domain/models/poll/poll-constants';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service/poll.service';
import { map, merge, Observable, of } from 'rxjs';
import { OptionData, OptionDataKey, PollData, PollDataKey } from 'src/app/domain/models/poll/generic-poll';
import { MotionPollServiceModule } from '../motion-poll-service.module';
import { MotionPollControllerService } from '../motion-poll-controller.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

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

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: PollParseNumberPipe,
        translate: TranslateService,
        private repo: MotionPollControllerService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber);
        this.meetingSettingsService
            .get(`motion_poll_default_100_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService.get(`motion_poll_default_type`).subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService.get(`motion_poll_default_group_ids`).subscribe(ids => (this.defaultGroupIds = ids));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: _(`Vote`),
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

    public generateTableDataAsObservable(poll: PollData): Observable<PollTableData[]> {
        // The "of(...)"-observable is used to fire the current state the first time.
        return merge(of(poll.options), poll.options_as_observable).pipe(
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
            poll.options.some(option => option.yes! >= 0 && option.no! >= 0 && option.abstain! >= 0)
        );
    }

    protected override getPollDataFields(poll: PollData): CalculablePollKey[] {
        switch (poll.onehundred_percent_base) {
            case PollPercentBase.YN:
                return [YES_KEY, NO_KEY];
            case PollPercentBase.Cast:
                return [YES_KEY, NO_KEY, ABSTAIN_KEY, INVALID_VOTES_KEY];
            default:
                return [YES_KEY, NO_KEY, ABSTAIN_KEY];
        }
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
            votingOption: result.vote || ``,
            value: [
                {
                    amount: (option
                        ? option[result.vote as OptionDataKey]
                        : poll[result.vote as PollDataKey]) as number,
                    hide: result.hide,
                    icon: result.icon,
                    showPercent: result.showPercent
                }
            ]
        };
    }
}
