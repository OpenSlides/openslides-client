import { inject, Service } from '@angular/core';
import { PollVisibility } from '@app/domain/models/poll';
import { Topic } from '@app/domain/models/topics/topic';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

@Service()
export class TopicPollService extends PollService {
    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    private defaultPercentBase = this.meetingPollSettingsService.signal(`topic`, `onehundred_percent_base`);
    private defaultGroupIds = this.meetingPollSettingsService.signal(`topic`, `group_ids`);
    private defaultEnableLiveVote = this.meetingPollSettingsService.signal(`topic`, `enable_live_voting`);
    private defaultPollType = this.meetingPollSettingsService.signal(`topic`, `visibility`);
    private defaultRequiredMajority = this.meetingPollSettingsService.signal(`topic`, `required_majority`);
    private defaultMethod = this.meetingPollSettingsService.signal(`topic`, `method`);

    public getDefaultPollData(contentObject?: Topic): Partial<ViewPoll> & { method_preselection?: string } {
        const poll: Partial<ViewPoll> & { method_preselection?: string } = {
            title: this.translate.instant(`Vote`),
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
