import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Id } from 'app/core/definitions/key-types';
import { BaseDecimalModel } from '../base/base-decimal-model';
import { HasProjectableIds } from '../base/has-projectable-ids';

/**
 * Iterable pre selection of genders (sexes)
 */
export const genders = [_('female'), _('male'), _('diverse')];

/**
 * Representation of a user in contrast to the operator.
 * @ignore
 */
export class User extends BaseDecimalModel<User> {
    public static COLLECTION = 'user';

    public id: Id;
    public username: string;
    public title: string;
    public first_name: string;
    public last_name: string;
    public is_active?: boolean;
    public is_committee: boolean;
    public default_password?: string;
    public about_me: string;
    public gender?: string;
    public comment?: string;
    public number: string;
    public structure_level: string;
    public email?: string;
    public last_email_send?: string; // ISO datetime string
    public vote_weight: number;

    public role_id?: Id; // role/user_ids;

    // Meeting and committee
    public is_present_in_meeting_ids: Id[]; // (meeting/present_user_ids)[];
    public meeting_id: Id; // meeting/temporary_user_ids;  // Temporary users
    public guest_meeting_ids: Id[]; // (meeting/guest_ids)[];  // Guests in meetings
    public committee_as_member_ids: Id[]; // (committee/member_ids)[];
    public committee_as_manager_ids: Id[]; // (committee/manager_ids)[];

    public group_$_ids: string[]; // (group/user_ids)[];
    public speaker_$_ids: string[]; // (speaker/user_id)[];
    public personal_note_$_ids: string[]; // (personal_note/user_id)[];
    public supported_motion_$_ids: string[]; // (motion/supporter_ids)[];
    public submitted_motion_$_ids: string[]; // (motion_submitter/user_id)[];
    public motion_poll_voted_$_ids: string[]; // (motion_poll/voted_ids)[];
    public motion_vote_$_ids: string[]; // (motion_vote/user_id)[];
    public assignment_candidate_$_ids: string[]; // (assignment_candidate/user_id)[];
    public assignment_poll_voted_$_ids: string[]; // (assignment_poll/voted_ids)[];
    public assignment_option_$_ids: string[]; // (assignment_option/user_id)[];
    public assignment_vote_$_ids: string[]; // (assignment_vote/user_id)[];

    public get isVoteWeightOne(): boolean {
        return this.vote_weight === 1;
    }

    public constructor(input?: Partial<User>) {
        super(User.COLLECTION, input);
    }

    public group_ids(meetingId: Id): Id[] {
        return this[`group_${meetingId}_ids`] || [];
    }

    public speaker_ids(meetingId: Id): Id[] {
        return this[`speaker_${meetingId}_ids`] || [];
    }

    public personal_note_ids(meetingId: Id): Id[] {
        return this[`personal_note_${meetingId}_ids`] || [];
    }

    public supported_motion_ids(meetingId: Id): Id[] {
        return this[`supported_motion_${meetingId}_ids`] || [];
    }

    public submitted_motion_ids(meetingId: Id): Id[] {
        return this[`submitted_motion_${meetingId}_ids`] || [];
    }

    public motion_poll_voted_ids(meetingId: Id): Id[] {
        return this[`motion_poll_voted_${meetingId}_ids`] || [];
    }

    public motion_vote_ids(meetingId: Id): Id[] {
        return this[`motion_vote_${meetingId}_ids`] || [];
    }

    public assignment_candidate_ids(meetingId: Id): Id[] {
        return this[`assignment_candidate_${meetingId}_ids`] || [];
    }

    public assignment_poll_voted_ids(meetingId: Id): Id[] {
        return this[`assignment_poll_voted_${meetingId}_ids`] || [];
    }

    public assignment_option_ids(meetingId: Id): Id[] {
        return this[`assignment_option_${meetingId}_ids`] || [];
    }

    public assignment_vote_ids(meetingId: Id): Id[] {
        return this[`assignment_vote_${meetingId}_ids`] || [];
    }

    protected getDecimalFields(): string[] {
        return ['vote_weight'];
    }
}
export interface User extends HasProjectableIds {}
