import { inject, Injectable } from '@angular/core';
import { PollVisibility } from '@app/domain/models/poll';
import { SelectionOnehundredPercentBase } from '@app/domain/models/poll/poll-config-selection';
import { BaseOnehundredPercentBase } from '@app/domain/models/poll/poll-config-types';
import { Topic } from '@app/domain/models/topics/topic';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

import { ViewTopic } from '../../../view-models';

@Injectable({
    providedIn: 'root'
})
export class TopicPollService extends PollService {
    private defaultPercentBase: BaseOnehundredPercentBase | SelectionOnehundredPercentBase;
    private defaultGroupIds: number[];
    private defaultEnableLiveVote = false;
    private defaultPollType: PollVisibility | undefined;
    private defaultVotingType: string;
    private defaultDisplayChart: string;
    private defaultAllowAbstain = false;
    private defaultAllowNota = false;
    private defaultActiveStrikeOut = false;

    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    public constructor(pollServiceMapper: PollServiceMapperService) {
        super();
        pollServiceMapper.registerService(ViewTopic.COLLECTION, this);
        this.meetingPollSettingsService
            .get(`topic`, `onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base ?? `valid`));

        this.meetingPollSettingsService.get(`topic`, `group_ids`).subscribe(ids => (this.defaultGroupIds = ids ?? []));
        this.meetingPollSettingsService
            .get(`topic`, `sort_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingPollSettingsService
            .get(`topic`, `allow_abstain`)
            .subscribe(bool => (this.defaultAllowAbstain = bool));
        this.meetingPollSettingsService.get(`topic`, `visibility`).subscribe(type => (this.defaultPollType = type));
        this.meetingPollSettingsService.get(`topic`, `allow_nota`).subscribe(bool => (this.defaultAllowNota = bool));
        this.meetingPollSettingsService
            .get(`topic`, `strike_out`)
            .subscribe(bool => (this.defaultActiveStrikeOut = bool));
        this.meetingPollSettingsService
            .get(`topic`, `display_chart`)
            .subscribe(chartType => (this.defaultDisplayChart = chartType));

        this.meetingSettingsService
            .get(`poll_default_live_voting_enabled`)
            .subscribe(is => (this.defaultEnableLiveVote = is));
        this.meetingSettingsService.get(`topic_poll_default_method`).subscribe(type => (this.defaultVotingType = type));
    }

    public getDefaultPollData(contentObject?: Topic): Partial<ViewPoll> {
        const poll: Partial<ViewPoll> = {
            title: this.translate.instant(`Ballot`),
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollType : PollVisibility.Manually,
            live_voting_enabled: this.defaultEnableLiveVote,
            config: {
                allow_abstain: this.defaultAllowAbstain,
                allow_nota: this.defaultAllowNota,
                strike_out: this.defaultActiveStrikeOut,
                display_chart: this.defaultDisplayChart,
                voting_type: this.defaultVotingType
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
