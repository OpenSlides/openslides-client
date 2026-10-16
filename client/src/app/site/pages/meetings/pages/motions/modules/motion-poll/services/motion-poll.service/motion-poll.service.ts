import { inject, Service } from '@angular/core';
import { Motion } from '@app/domain/models/motions/motion';
import { PollVisibility } from '@app/domain/models/poll/poll-constants';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service/poll.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

import { MotionPollControllerService } from '../motion-poll-controller.service/motion-poll-controller.service';

/**
 * Service class for motion polls.
 */
@Service()
export class MotionPollService extends PollService {
    private repo = inject(MotionPollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    private defaultPollVisibility = this.meetingPollSettingsService.signal(`motion`, `visibility`);
    private defaultGroupIds = this.meetingPollSettingsService.signal(`motion`, `group_ids`);
    private defaultMethod = this.meetingPollSettingsService.signal(`motion`, `method`);
    private defaultLiveVoting = this.meetingPollSettingsService.signal(`motion`, `enable_live_voting`);
    private defaultRequiredMajority = this.meetingPollSettingsService.signal(`motion`, `required_majority`);
    private defaultPercentBase = this.meetingPollSettingsService.signal(`motion`, `onehundred_percent_base`);

    public getDefaultPollData(contentObject?: Motion): Partial<ViewPoll> & { method_preselection?: string } {
        const poll: Partial<ViewPoll> & { method_preselection?: string } = {
            visibility: this.isElectronicVotingEnabled ? this.defaultPollVisibility() : PollVisibility.Manually,
            entitled_group_ids: Object.values(this.defaultGroupIds() ?? []),
            live_voting_enabled: this.defaultLiveVoting(),
            config: {
                allow_abstain: this.defaultMethod().endsWith(`yes_no_abstain`),
                onehundred_percent_base: this.defaultPercentBase(),
                required_majority: this.defaultRequiredMajority()
            }
        };

        let titlePrefix = this.translate.instant(`Motion`);
        let title = this.translate.instant(`Vote`);

        if (contentObject) {
            if (contentObject.number) {
                titlePrefix += ` ${contentObject.number}`;
            }

            const length = this.repo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                title += ` (${length + 1})`;
            }
        }

        poll.title = `${titlePrefix} ${title}`;

        return poll;
    }
}
