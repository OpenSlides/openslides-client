import { inject, Injectable } from '@angular/core';
import { SelectionOnehundredPercentBase } from '@app/domain/models/poll/poll-config-selection';
import { BaseOnehundredPercentBase } from '@app/domain/models/poll/poll-config-types';
import { Topic } from '@app/domain/models/topics/topic';
import { PollDialogData } from '@app/site/pages/meetings/modules/poll/definitions';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

import { ViewTopic } from '../../../view-models';

@Injectable({
    providedIn: 'root'
})
export class TopicPollService extends PollService {
    public defaultPercentBase: BaseOnehundredPercentBase | SelectionOnehundredPercentBase;
    public defaultGroupIds: number[];

    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    public constructor(pollServiceMapper: PollServiceMapperService) {
        super();
        pollServiceMapper.registerService(ViewTopic.COLLECTION, this);
        this.meetingSettingsService
            .get(`poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base ?? `valid`));

        this.meetingPollSettingsService.get(`topic`, `group_ids`).subscribe(ids => (this.defaultGroupIds = ids ?? []));

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
