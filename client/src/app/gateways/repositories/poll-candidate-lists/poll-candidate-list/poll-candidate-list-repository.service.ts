import { Injectable } from '@angular/core';
import { PollCandidateList } from 'src/app/domain/models/poll-candidate-lists/poll-candidate-list';
import { ViewPollCandidateList } from 'src/app/site/pages/meetings/pages/polls/view-models/view-poll-candidate-list';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

/**
 * Repository service for the PollCandidateList.
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
export class PollCandidateListRepositoryService extends BaseMeetingRelatedRepository<ViewPollCandidateList, PollCandidateList> {

    public constructor(
        repoServiceCollector: RepositoryMeetingServiceCollectorService
    ) {
        super(repoServiceCollector, PollCandidateList);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `PollCandidateLists` : `PollCandidateList`);
    public getTitle = (viewModel: ViewPollCandidateList): string => viewModel.poll_candidates.map(candidate => candidate.getTitle()).join(`, `);

    public override getFieldsets(): Fieldsets<PollCandidateList> {
        const detailFieldset: (keyof PollCandidateList)[] = [
            `poll_candidate_ids`,
            `option_id`,
            `meeting_id`
        ];
        return {
            [DEFAULT_FIELDSET]: detailFieldset
        };
    }
}
