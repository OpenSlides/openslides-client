import { inject, Service } from '@angular/core';
import { PollVisibility } from '@app/domain/models/poll';
import { Topic } from '@app/domain/models/topics/topic';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

import { ViewTopic } from '../../../view-models/view-topic';

@Service()
export class TopicPollService extends PollService {
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
        pollServiceMapper.registerService(ViewTopic.COLLECTION, this);

        this.meetingPollSettingsService
            .get(`topic`, `sort_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
    }

    public getDefaultPollData(contentObject?: Topic): Partial<ViewPoll> {
        const poll: Partial<ViewPoll> = {
            title: this.translate.instant(`Poll`),
            entitled_group_ids: Object.values(this.defaultGroupIds() ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollType() : PollVisibility.Manually,
            live_voting_enabled: this.defaultEnableLiveVote(),
            config: {
                allow_abstain: this.defaultAllowAbstain(),
                allow_nota: this.defaultAllowNota(),
                strike_out: this.defaultActiveStrikeOut(),
                display_chart: this.defaultDisplayChart(),
                voting_type: this.defaultVotingType(),
                onehundred_percent_base: this.defaultPercentBase(),
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
