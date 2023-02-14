import { PollCandidateList } from "src/app/domain/models/poll-candidate-lists/poll-candidate-list";
import { BaseViewModel } from "src/app/site/base/base-view-model";

import { HasMeeting } from "../../../view-models/has-meeting";
import { ViewOption } from "./view-option";
import { ViewPollCandidate } from "./view-poll-candidate";

export class ViewPollCandidateList extends BaseViewModel<PollCandidateList>
{
    public get poll_candidate_list(): PollCandidateList {
        return this._model;
    }
    public static COLLECTION = PollCandidateList.COLLECTION;
}

interface IPollCandidateListRelations {
    poll_candidates: ViewPollCandidate[];
    option: ViewOption;
}
export interface ViewPollCandidateList extends HasMeeting, IPollCandidateListRelations, PollCandidateList {}
