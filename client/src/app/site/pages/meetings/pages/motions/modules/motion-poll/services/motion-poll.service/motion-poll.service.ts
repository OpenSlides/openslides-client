import { inject, Service } from '@angular/core';
import { Motion } from '@app/domain/models/motions/motion';
import { BaseOnehundredPercentBase } from '@app/domain/models/poll/poll-config-types';
import { PollVisibility } from '@app/domain/models/poll/poll-constants';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service/poll.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { MeetingPollSettingsService } from '@app/site/pages/meetings/services/meeting-poll-settings.service';

import { MotionPollControllerService } from '../motion-poll-controller.service';

/**
 * Service class for motion polls.
 */
@Service()
export class MotionPollService extends PollService {
    public defaultPercentBase!: BaseOnehundredPercentBase;
    public defaultPollVisibility!: PollVisibility;
    public defaultGroupIds!: number[];
    public defaultAllowAbstain = false;

    private repo = inject(MotionPollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    public constructor() {
        super();
        this.meetingPollSettingsService
            .get(`motion`, `onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingPollSettingsService
            .get(`motion`, `visibility`)
            .subscribe(type => (this.defaultPollVisibility = type as any));
        this.meetingPollSettingsService.get(`motion`, `group_ids`).subscribe(ids => (this.defaultGroupIds = ids ?? []));
        this.meetingPollSettingsService
            .get(`motion`, `allow_abstain`)
            .subscribe(bool => (this.defaultAllowAbstain = bool));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<ViewPoll> {
        const poll: Partial<ViewPoll> = {
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollVisibility : PollVisibility.Manually,
            config: {
                allow_abstain: this.defaultAllowAbstain,
                onehundred_percent_base: this.defaultPercentBase
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
