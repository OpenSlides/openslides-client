import { inject, Injectable } from '@angular/core';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { PollVisibility } from '@app/domain/models/poll';
import { Poll } from '@app/domain/models/poll/poll';
import { BaseOnehundredPercentBase } from '@app/domain/models/poll/poll-config-types';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';
import { _ } from '@ngx-translate/core';

import { PollService } from '../../../../../modules/poll/services/poll.service/poll.service';
import { PollControllerService } from '../../../../../modules/poll/services/poll-controller.service/poll-controller.service';

export const UnknownUserLabel = _(`Deleted user`);

/**
 * The assignment poll service should not have too much content since the poll system in OS4
 * perfectly fits on assignments. Motion polls are now the special case; assignment polls should
 * be the default case.
 */
@Injectable({ providedIn: `root` })
export class AssignmentPollService extends PollService {
    private defaultPercentBase: BaseOnehundredPercentBase | undefined;
    private defaultPollType: PollVisibility | undefined;
    private defaultVotingType: any;
    private defaultGroupIds: number[] = [];
    private defaultAllowAbstain = false;
    private defaultAllowNota = false;
    private defaultActiveStrikeOut = false;
    private defaultEnableLiveVote = false;
    private defaultDisplayChart: string;

    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    public constructor(pollServiceMapper: PollServiceMapperService) {
        super();
        pollServiceMapper.registerService(ViewAssignment.COLLECTION, this);
        this.meetingPollSettingsService
            .get(`assignment`, `onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingPollSettingsService
            .get(`assignment`, `group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids ?? []));
        this.meetingPollSettingsService
            .get(`assignment`, `sort_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingPollSettingsService
            .get(`assignment`, `allow_abstain`)
            .subscribe(bool => (this.defaultAllowAbstain = bool));
        this.meetingPollSettingsService
            .get(`assignment`, `visibility`)
            .subscribe(type => (this.defaultPollType = type));
        this.meetingPollSettingsService
            .get(`assignment`, `allow_nota`)
            .subscribe(bool => (this.defaultAllowNota = bool));
        this.meetingPollSettingsService
            .get(`assignment`, `strike_out`)
            .subscribe(bool => (this.defaultActiveStrikeOut = bool));
        this.meetingPollSettingsService
            .get(`assignment`, `display_chart`)
            .subscribe(chartType => (this.defaultDisplayChart = chartType));

        this.meetingSettingsService
            .get(`poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option));
        this.meetingSettingsService
            .get(`poll_default_live_voting_enabled`)
            .subscribe(is => (this.defaultEnableLiveVote = is));
        this.meetingSettingsService
            .get(`assignment_poll_default_method`)
            .subscribe(type => (this.defaultVotingType = type));
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Ballot`),
            // onehundred_percent_base: this.defaultPercentBase,
            // pollmethod: this.defaultPollMethod,
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollType : PollVisibility.Manually,
            onehundred_percent_base: this.defaultPercentBase,
            allow_abstain: this.defaultAllowAbstain,
            allow_nota: this.defaultAllowNota,
            strike_out: this.defaultActiveStrikeOut,
            display_chart: this.defaultDisplayChart,
            live_voting_enabled: this.defaultEnableLiveVote,
            voting_type: this.defaultVotingType
        };

        if (contentObject) {
            const length = this.pollRepo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }
}
