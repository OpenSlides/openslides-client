import { Injectable } from '@angular/core';
import { PollCandidate } from 'src/app/domain/models/poll-candidate-lists/poll-candidate';
import { ViewPollCandidate } from 'src/app/site/pages/meetings/pages/polls/view-models/view-poll-candidate';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

/**
 * Repository service for the PollCandidate.
 *
 * Since this model will be exclusively found/called through the related models
 * and has no actions that would need to be called by the client,
 * there is no need for a corresponding controller service, since it wouldn't be used anyway.
 *
 * Should it ever become necessary to perform actions or call upon the ViewModelLists,
 * please create a new controller service instead of directly calling the repository.
 */
@Injectable({
    providedIn: `root`
})
export class PollCandidateRepositoryService extends BaseMeetingRelatedRepository<ViewPollCandidate, PollCandidate> {

    public constructor(
        repoServiceCollector: RepositoryMeetingServiceCollectorService
    ) {
        super(repoServiceCollector, PollCandidate);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `PollCandidates` : `PollCandidate`);
    public getTitle = (viewModel: ViewPollCandidate): string => viewModel.user?.getTitle();

    public override getFieldsets(): Fieldsets<PollCandidate> {
        const detailFieldset: (keyof PollCandidate)[] = [
            `poll_candidate_list_id`,
            `user_id`,
            `weight`,
            `meeting_id`
        ];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }
}
