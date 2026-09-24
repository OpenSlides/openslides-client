import { inject, Service } from '@angular/core';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { PollVisibility } from '@app/domain/models/poll';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
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
@Service()
export class AssignmentPollService extends PollService {
    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    private defaultPercentBase = this.meetingPollSettingsService.signal(`topic`, `onehundred_percent_base`);
    private defaultGroupIds = this.meetingPollSettingsService.signal(`topic`, `group_ids`);
    private defaultEnableLiveVote = this.meetingSettingsService.signal(`poll_default_live_voting_enabled`);
    private defaultPollType = this.meetingPollSettingsService.signal(`topic`, `visibility`);
    private defaultVotingType = this.meetingSettingsService.signal(`topic_poll_default_method`);
    private defaultDisplayChart = this.meetingPollSettingsService.signal(`topic`, `display_chart`);
    private defaultAllowAbstain = this.meetingPollSettingsService.signal(`topic`, `allow_abstain`);
    private defaultAllowNota = this.meetingPollSettingsService.signal(`topic`, `allow_nota`);
    private defaultActiveStrikeOut = this.meetingPollSettingsService.signal(`topic`, `strike_out`);
    private defaultRequiredMajority = this.meetingSettingsService.signal(`poll_default_required_majority`);

    public constructor() {
        super();
        const pollServiceMapper = inject(PollServiceMapperService);
        pollServiceMapper.registerService(ViewAssignment.COLLECTION, this);
        this.meetingPollSettingsService
            .get(`assignment`, `sort_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));

        this.meetingSettingsService
            .get(`poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option));
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<ViewPoll> {
        const poll: Partial<ViewPoll> = {
            title: this.translate.instant(`Ballot`),
            entitled_group_ids: Object.values(this.defaultGroupIds() ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollType() : PollVisibility.Manually,
            live_voting_enabled: this.defaultEnableLiveVote(),
            config: {
                allow_abstain: this.defaultAllowAbstain(),
                allow_nota: this.defaultAllowNota(),
                strike_out: this.defaultActiveStrikeOut(),
                onehundred_percent_base: this.defaultPercentBase(),
                display_chart: this.defaultDisplayChart(),
                method: this.defaultVotingType(),
                required_majority: this.defaultRequiredMajority()
            }
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
