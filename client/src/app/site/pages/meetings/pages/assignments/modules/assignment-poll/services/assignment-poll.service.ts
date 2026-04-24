import { Injectable } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { PollVisibility } from 'src/app/domain/models/poll';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollMethod, PollPercentBase, PollType } from 'src/app/domain/models/poll/poll-constants';
import { PollServiceMapperService } from 'src/app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';

import { PollService } from '../../../../../modules/poll/services/poll.service/poll.service';
import { PollControllerService } from '../../../../../modules/poll/services/poll-controller.service/poll-controller.service';
import { AssignmentPollServiceModule } from './assignment-poll-service.module';

export const UnknownUserLabel = _(`Deleted user`);

/**
 * The assignment poll service should not have too much content since the poll system in OS4
 * perfectly fits on assignments. Motion polls are now the special case; assignment polls should
 * be the default case.
 */
@Injectable({ providedIn: AssignmentPollServiceModule })
export class AssignmentPollService extends PollService {
    public defaultPollMethod: PollMethod | undefined;
    public defaultPercentBase: PollPercentBase | undefined;
    public defaultPollType: PollType | undefined;
    public defaultGroupIds: number[] = [];

    public constructor(
        pollServiceMapper: PollServiceMapperService,
        protected override translate: TranslateService,
        private pollRepo: PollControllerService
    ) {
        super();
        pollServiceMapper.registerService(ViewAssignment.COLLECTION, this);
        this.meetingSettingsService
            .get(`assignment_poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService
            .get(`assignment_poll_default_group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids));
        this.meetingSettingsService
            .get(`assignment_poll_default_method`)
            .subscribe(method => (this.defaultPollMethod = method));
        this.meetingSettingsService
            .get(`assignment_poll_default_type`)
            .subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService
            .get(`assignment_poll_sort_poll_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingSettingsService
            .get(`assignment_poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option));
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Ballot`),
            // onehundred_percent_base: this.defaultPercentBase,
            // pollmethod: this.defaultPollMethod,
            entitled_group_ids: Object.values(this.defaultGroupIds ?? []),
            visibility: this.isElectronicVotingEnabled
                ? (this.defaultPollType as unknown as PollVisibility)
                : PollVisibility.Manually
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
