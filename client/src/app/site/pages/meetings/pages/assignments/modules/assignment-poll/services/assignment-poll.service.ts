import { inject, Service } from '@angular/core';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { PollVisibility } from '@app/domain/models/poll';
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

    private defaultPercentBase = this.meetingPollSettingsService.signal(`assignment`, `onehundred_percent_base`);
    private defaultGroupIds = this.meetingPollSettingsService.signal(`assignment`, `group_ids`);
    private defaultEnableLiveVote = this.meetingPollSettingsService.signal(`assignment`, `enable_live_voting`);
    private defaultPollType = this.meetingPollSettingsService.signal(`assignment`, `visibility`);
    private defaultRequiredMajority = this.meetingPollSettingsService.signal(`assignment`, `required_majority`);
    private defaultMethod = this.meetingPollSettingsService.signal(`assignment`, `method`);

    public getDefaultPollData(contentObject?: Assignment): Partial<ViewPoll> & { method_preselection?: string } {
        const poll: Partial<ViewPoll> & { method_preselection?: string } = {
            title: this.translate.instant(`Ballot`),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollType() : PollVisibility.Manually,
            entitled_group_ids: Object.values(this.defaultGroupIds() ?? []),
            live_voting_enabled: this.defaultEnableLiveVote(),
            method_preselection: this.defaultMethod(),
            config: {
                onehundred_percent_base: this.defaultPercentBase(),
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
