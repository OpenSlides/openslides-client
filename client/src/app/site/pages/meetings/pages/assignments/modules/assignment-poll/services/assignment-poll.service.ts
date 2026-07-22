import { inject, Service } from '@angular/core';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { PollVisibility } from '@app/domain/models/poll';
import { Poll } from '@app/domain/models/poll/poll';
import { BaseOnehundredPercentBase } from '@app/domain/models/poll/poll-config-types';
import { PollServiceMapperService } from '@app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
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
    public defaultPercentBase: BaseOnehundredPercentBase | undefined;
    public defaultPollType: PollVisibility | undefined;
    public defaultGroupIds: number[] = [];

    private pollRepo = inject(PollControllerService);
    private meetingPollSettingsService = inject(MeetingPollSettingsService);

    public constructor() {
        super();
        const pollServiceMapper = inject(PollServiceMapperService);
        pollServiceMapper.registerService(ViewAssignment.COLLECTION, this);
        this.meetingPollSettingsService
            .get(`assignment`, `onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingPollSettingsService
            .get(`assignment`, `group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids ?? []));
        this.meetingPollSettingsService
            .get(`assignment`, `sort_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingSettingsService
            .get(`poll_enable_max_votes_per_option`)
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
