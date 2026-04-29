import { Injectable } from '@angular/core';
import { SelectionOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-selection';
import { BaseOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-types';
import { Topic } from 'src/app/domain/models/topics/topic';
import { PollDialogData } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { PollServiceMapperService } from 'src/app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';

import { ViewTopic } from '../../../view-models';
import { TopicPollServiceModule } from './topic-poll-service.module';

@Injectable({
    providedIn: TopicPollServiceModule
})
export class TopicPollService extends PollService {
    public defaultPercentBase: BaseOnehundredPercentBase | SelectionOnehundredPercentBase;
    public defaultGroupIds: number[];

    public constructor(
        pollServiceMapper: PollServiceMapperService,
        private pollRepo: PollControllerService
    ) {
        super();
        pollServiceMapper.registerService(ViewTopic.COLLECTION, this);
        this.meetingSettingsService
            .get(`poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base ?? `valid`));

        this.meetingSettingsService
            .get(`topic_poll_default_group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids ?? []));

        this.meetingSettingsService.get(`poll_sort_poll_result_by_votes`).subscribe(sort => (this.sortByVote = sort));
    }

    public getDefaultPollData(contentObject: Topic): Partial<PollDialogData> {
        const poll: Partial<PollDialogData> = {
            content_object: contentObject,
            title: this.translate.instant(`Vote`),
            // onehundred_percent_base: this.defaultPercentBase,
            // pollmethod: this.defaultPollMethod,
            // type: PollType.Pseudoanonymous,
            entitled_group_ids: Object.values(this.defaultGroupIds ?? [])
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
