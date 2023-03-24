import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

export class PollCandidateList extends BaseModel<PollCandidateList> {
    public static COLLECTION = `poll_candidate_list`;

    public option_id!: Id; // option/content_object_id;
    public poll_candidate_ids!: Id[]; // poll_candidate/poll_candidate_list_id;

    public constructor(input?: any) {
        super(PollCandidateList.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollCandidateList | { templateField: string })[] = [
        `id`,
        `poll_candidate_ids`,
        `meeting_id`,
        `option_id`
    ];
}
export interface PollCandidateList extends HasMeetingId {}
