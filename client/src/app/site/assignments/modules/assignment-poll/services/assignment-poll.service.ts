import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { Assignment } from 'app/shared/models/assignments/assignment';
import { OptionData, PollData } from 'app/shared/models/poll/generic-poll';
import { Poll } from 'app/shared/models/poll/poll';
import {
    ABSTAIN_KEY,
    NO_KEY,
    PollMethod,
    PollPercentBase,
    PollType,
    YES_KEY
} from 'app/shared/models/poll/poll-constants';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';
import { CalculablePollKey, PollService } from 'app/site/polls/services/poll.service';

export const UnknownUserLabel = _(`Deleted user`);

/**
 * The assignment poll service should not have too much content since the poll system in OS4
 * perfectly fits on assignments. Motion polls are now the special case; assignment polls should
 * be the default case.
 */
@Injectable({
    providedIn: `root`
})
export class AssignmentPollService extends PollService {
    public defaultPollMethod: PollMethod;
    public defaultPercentBase: PollPercentBase;
    public defaultGroupIds: number[];
    public defaultPollType: PollType;

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: ParsePollNumberPipe,
        protected translate: TranslateService,
        private pollRepo: PollRepositoryService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber);
        this.meetingSettingsService
            .get(`assignment_poll_default_100_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService
            .get(`assignment_poll_default_group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids));
        this.meetingSettingsService
            .get(`assignment_poll_default_method`)
            .subscribe(method => (this.defaultPollMethod = method));
        this.meetingSettingsService
            .get(`assignment_poll_default_type`)
            .subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService
            .get(`assignment_poll_sort_poll_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingSettingsService
            .get(`assignment_poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option))
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Ballot`),
            onehundred_percent_base: this.defaultPercentBase,
            entitled_group_ids: this.defaultGroupIds,
            pollmethod: this.defaultPollMethod,
            type: this.isElectronicVotingEnabled ? this.defaultPollType : PollType.Analog
        };

        if (contentObject) {
            const length = this.pollRepo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    protected getPollDataFields(poll: PollData): CalculablePollKey[] {
        switch (poll.pollmethod) {
            case PollMethod.YNA: {
                return [YES_KEY, NO_KEY, ABSTAIN_KEY];
            }
            case PollMethod.YN: {
                return [YES_KEY, NO_KEY];
            }
            case PollMethod.N: {
                return [NO_KEY];
            }
            default: {
                return [YES_KEY];
            }
        }
    }

    protected getPercentBase(poll: PollData, row?: OptionData): number {
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
        const generalOptions = poll.global_option.abstain + poll.global_option.no;
        return poll.votesvalid - generalOptions;
    }
}
