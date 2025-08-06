import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces';
import { BaseModel } from '../base/base-model';

export class PollCandidate extends BaseModel<PollCandidate> {
    public static COLLECTION = `poll_candidate`;

    public weight!: number;

    public poll_candidate_list_id!: Id; // poll_candidate_list/poll_candidate_ids;
    public user_id!: Id; // user/poll_candidate_ids;

    public constructor(input?: any) {
        super(PollCandidate.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof PollCandidate)[] = [
        `id`,
        `poll_candidate_list_id`,
        `user_id`,
        `weight`,
        `meeting_id`
    ];
}
export interface PollCandidate extends HasMeetingId {}
