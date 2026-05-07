import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Motion } from 'src/app/domain/models/motions/motion';
import { Poll } from 'src/app/domain/models/poll/poll';
import { BaseOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-types';
import { PollVisibility } from 'src/app/domain/models/poll/poll-constants';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service/poll.service';

import { MotionPollControllerService } from '../motion-poll-controller.service';

/**
 * Service class for motion polls.
 */
@Injectable({
    providedIn: `root`
})
export class MotionPollService extends PollService {
    public defaultPercentBase!: BaseOnehundredPercentBase;
    public defaultPollVisibility!: PollVisibility;
    public defaultGroupIds!: number[];

    public constructor(
        protected override translate: TranslateService,
        private repo: MotionPollControllerService
    ) {
        super();
        this.meetingSettingsService
            .get(`motion_poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService
            .get(`motion_poll_default_type`)
            .subscribe(type => (this.defaultPollVisibility = type as any));
        this.meetingSettingsService.get(`motion_poll_default_group_ids`).subscribe(ids => (this.defaultGroupIds = ids));
    }

    public getDefaultPollData(contentObject?: Motion): Partial<Poll> {
        const poll: Partial<Poll> = {
            // onehundred_percent_base: this.defaultPercentBase,
            // pollmethod: this.defaultPollMethod
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
            visibility: this.isElectronicVotingEnabled ? this.defaultPollVisibility : PollVisibility.Manually
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
