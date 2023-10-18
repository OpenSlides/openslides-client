import { PollCandidate } from 'src/app/domain/models/poll-candidate-lists/poll-candidate';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewUser } from '../../../view-models/view-user';
import { SortedListEntry } from './sorted-list';
import { ViewPollCandidateList } from './view-poll-candidate-list';

export class ViewPollCandidate extends BaseViewModel<PollCandidate> implements SortedListEntry {
    public get poll_candidate(): PollCandidate {
        return this._model;
    }

    public static COLLECTION = PollCandidate.COLLECTION;

    public getSubtitle(): string {
        return this.user?.getLevelAndNumber() ?? ``;
    }
}

interface IPollCandidateRelations {
    poll_candidate_list: ViewPollCandidateList;
    user: ViewUser;
}
export interface ViewPollCandidate extends HasMeeting, IPollCandidateRelations, PollCandidate {}
