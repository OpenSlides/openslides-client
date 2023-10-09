import { PollCandidateList } from 'src/app/domain/models/poll-candidate-lists/poll-candidate-list';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { HasMeeting } from '../../../view-models/has-meeting';
import { SortedList, SortedListEntry } from './sorted-list';
import { ViewOption } from './view-option';
import { ViewPollCandidate } from './view-poll-candidate';

export class ViewPollCandidateList extends BaseViewModel<PollCandidateList> implements SortedList {
    public get entries(): SortedListEntry[] {
        return this.poll_candidates;
    }

    public get poll_candidate_list(): PollCandidateList {
        return this._model;
    }

    public static COLLECTION = PollCandidateList.COLLECTION;

    public getShortenedTitle(length: number): string {
        const title = this.getTitle();
        if (length < 1) {
            throw new Error(`Selected length of shortened title too small`);
        } else if (title && length >= title?.length) {
            return title;
        }
        return title.slice(0, length - 2) + `…`;
    }
}

interface IPollCandidateListRelations {
    poll_candidates: ViewPollCandidate[];
    option: ViewOption;
}
export interface ViewPollCandidateList extends HasMeeting, IPollCandidateListRelations, PollCandidateList {}
