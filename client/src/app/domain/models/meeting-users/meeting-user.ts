import { Id } from '../../definitions/key-types';
import { BaseDecimalModel } from '../base/base-decimal-model';

/**
 * Representation of a meeting_user in contrast to the operator.
 */
export class MeetingUser extends BaseDecimalModel<MeetingUser> {
    public static COLLECTION = `meeting_user`;

    public readonly comment!: string;
    public readonly number!: string;
    public readonly about_me!: string;
    public readonly vote_weight!: number;
    public readonly locked_out!: boolean;

    public user_id!: Id;
    public meeting_id!: Id;

    public vote_delegated_to_id!: Id; // meeting_user/vote_delegations_from_ids;

    public group_ids!: Id[]; // (group/meeting_user_ids)[];
    public speaker_ids!: Id[]; // (speaker/meeting_user_id)[];
    public personal_note_ids!: Id[]; // (personal_note/meeting_user_id)[];
    public supported_motion_ids!: Id[]; // (motion/supporter_meeting_user_ids)[];
    public submitted_motion_ids!: Id[]; // (motion_submitter/meeting_user_id)[];
    public assignment_candidate_ids!: Id[]; // (assignment_candidate/meeting_user_id)[];
    public vote_delegated_vote_ids!: Id[];
    public vote_delegations_from_ids!: Id[]; // meeting_user/vote_delegated_to_id;
    public chat_message_ids!: Id[]; // (chat_message/meeting_user_id)[];
    public structure_level_ids: Id[]; // structure_level/meeting_user_ids

    public constructor(input?: Partial<MeetingUser>) {
        super(MeetingUser.COLLECTION, input);
    }

    protected getDecimalFields(): (keyof MeetingUser)[] {
        return [`vote_weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof MeetingUser)[] = [
        `id`,
        `comment`,
        `number`,
        `about_me`,
        `vote_weight`,
        `locked_out`,
        `user_id`,
        `meeting_id`,
        `personal_note_ids`,
        `speaker_ids`,
        `supported_motion_ids`,
        `assignment_candidate_ids`,
        `vote_delegated_to_id`,
        `vote_delegations_from_ids`,
        `chat_message_ids`,
        `group_ids`,
        `structure_level_ids`
    ];
}
export interface MeetingUser {}
