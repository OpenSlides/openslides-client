import { Id } from "../../definitions/key-types";
import { HasMeetingId } from "../../interfaces";
import { BaseModel } from "../base/base-model";

export class PollCandidateList extends BaseModel<PollCandidateList> {
    public static COLLECTION = `poll_candidate_list`;

    public option_id!: Id; // option/content_object_id;
    public poll_candidate_ids!: Id[]; // poll_candidate/poll_candidate_list_id;

    public constructor(input?: any) {
        super(PollCandidateList.COLLECTION, input);
    }
}
export interface PollCandidateList extends HasMeetingId {}
