import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Id } from '../../definitions/key-types';
import { CML, OMLMapping } from '../../definitions/organization-permission';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseDecimalModel } from '../base/base-decimal-model';
/**
 * Key to sort users by
 */
export type UserSortProperty = 'first_name' | 'last_name' | 'number';

/**
 * Iterable pre selection of genders
 */
export const GENDERS = [_(`female`), _(`male`), _(`diverse`), _(`non-binary`)];

/**
 * Representation of a user in contrast to the operator.
 */
export class User extends BaseDecimalModel<User> {
    public static COLLECTION = `user`;

    public readonly username!: string;
    public readonly title!: string;
    public readonly pronoun!: string;
    public readonly first_name!: string;
    public readonly last_name!: string;
    public readonly is_active!: boolean;
    public readonly is_physical_person!: boolean;
    public readonly default_password!: string;
    public readonly can_change_own_password!: boolean;
    public readonly gender!: string;
    public readonly comment_$!: string[];
    public readonly number_$!: string[];
    public readonly about_me_$!: string[];
    public readonly default_number!: string;
    public readonly default_structure_level!: string;
    public readonly structure_level_$!: string[];
    public readonly email!: string;
    public readonly last_email_sent!: number; // comes in seconds
    public readonly last_login!: number; // comes in seconds
    public readonly vote_weight_$!: number[];
    public readonly default_vote_weight!: number;
    public readonly is_demo_user!: boolean;

    // Meeting and committee
    public meeting_ids!: Id[]; // (meeting/user_ids)[];
    public is_present_in_meeting_ids!: Id[]; // (meeting/present_user_ids)[];
    public committee_ids!: Id[]; // (committee/user_ids)[];

    public group_$_ids!: string[]; // (group/user_ids)[];
    public speaker_$_ids!: string[]; // (speaker/user_id)[];
    public personal_note_$_ids!: string[]; // (personal_note/user_id)[];
    public supported_motion_$_ids!: string[]; // (motion/supporter_ids)[];
    public submitted_motion_$_ids!: string[]; // (motion_submitter/user_id)[];
    public poll_voted_$_ids!: string[]; // (poll/voted_ids)[];
    public vote_$_ids!: string[]; // (vote/user_id)[];
    public delegated_vote_$_ids!: string[]; // (vote/delegated_user_id)[];
    public option_$_ids!: string[];
    public assignment_candidate_$_ids!: string[]; // (assignment_candidate/user_id)[];
    public vote_delegated_$_vote_ids!: string[];
    public vote_delegated_$_to_id!: string[]; // user/vote_delegated_$<meeting_id>_from_ids;
    public vote_delegations_$_from_ids!: string[]; // user/vote_delegated_$<meeting_id>_to_id;
    public chat_message_$_ids!: Id[]; // (chat_message/user_id)[];
    public poll_candidate_ids!: Id[]; // (poll_candidate/user_id);
    public organization_id!: Id; // organization/committee_ids;

    public projection_$_ids!: any[];
    public current_projector_$_ids!: any[];

    public organization_management_level!: keyof OMLMapping;
    public committee_$_management_level!: CML[];

    public constructor(input?: Partial<User>) {
        super(User.COLLECTION, input);
    }

    public hasVoteRightFromOthers(meetingId: Id): boolean {
        return this.vote_delegations_from_ids(meetingId)?.length > 0;
    }

    public vote_weight(meetingId: Id): number {
        return ((this as any)[`vote_weight_$${meetingId}`] as number) ?? this.default_vote_weight;
    }

    public structure_level(meetingId: Id): string {
        return ((this as any)[`structure_level_$${meetingId}`] as string) || this.default_structure_level;
    }

    public number(meetingId: Id): string {
        return ((this as any)[`number_$${meetingId}`] as string) || this.default_number;
    }

    public about_me(meetingId: Id): string {
        return (this as any)[`about_me_$${meetingId}`] as string;
    }

    public comment(meetingId: Id): string {
        return (this as any)[`comment_$${meetingId}`] as string;
    }

    public group_ids(meetingId: Id): Id[] {
        return (this as any)[`group_$${meetingId}_ids`] || [];
    }

    public speaker_ids(meetingId: Id): Id[] {
        return (this as any)[`speaker_$${meetingId}_ids`] || [];
    }

    public personal_note_ids(meetingId: Id): Id[] {
        return (this as any)[`personal_note_$${meetingId}_ids`] || [];
    }

    public supported_motion_ids(meetingId: Id): Id[] {
        return (this as any)[`supported_motion_$${meetingId}_ids`] || [];
    }

    public submitted_motion_ids(meetingId: Id): Id[] {
        return (this as any)[`submitted_motion_$${meetingId}_ids`] || [];
    }

    public motion_poll_voted_ids(meetingId: Id): Id[] {
        return (this as any)[`motion_poll_voted_$${meetingId}_ids`] || [];
    }

    public motion_vote_ids(meetingId: Id): Id[] {
        return (this as any)[`motion_vote_$${meetingId}_ids`] || [];
    }

    public motion_delegated_vote_ids(meetingId: Id): Id[] {
        return (this as any)[`motion_delegated_vote_$${meetingId}_ids`] || [];
    }

    public assignment_candidate_ids(meetingId: Id): Id[] {
        return (this as any)[`assignment_candidate_$${meetingId}_ids`] || [];
    }

    public chat_message_ids(meetingId: Id): Id[] {
        return (this as any)[`chat_message_$${meetingId}_ids`];
    }

    public assignment_poll_voted_ids(meetingId: Id): Id[] {
        return (this as any)[`assignment_poll_voted_$${meetingId}_ids`] || [];
    }

    public assignment_option_ids(meetingId: Id): Id[] {
        return (this as any)[`assignment_option_$${meetingId}_ids`] || [];
    }

    public assignment_vote_ids(meetingId: Id): Id[] {
        return (this as any)[`assignment_vote_$${meetingId}_ids`] || [];
    }

    public assignment_delegated_vote_ids(meetingId: Id): Id[] {
        return (this as any)[`assignment_delegated_vote_$${meetingId}_ids`] || [];
    }

    public vote_delegated_to_id(meetingId: Id): Id {
        return this.vote_delegated_$_to_id?.includes(`${meetingId}`)
            ? (this as any)[`vote_delegated_$${meetingId}_to_id`]
            : undefined;
    }

    public vote_delegations_from_ids(meetingId: Id): Id[] {
        if (this.vote_delegations_$_from_ids?.includes(`${meetingId}`)) {
            return (this as any)[`vote_delegations_$${meetingId}_from_ids`] || [];
        }
        return [];
    }

    /**
     * Gives every committee id, a user has a requested committee permission.
     *
     * @param cml The committee permission to query
     * @returns A list of committee ids, a user has the queried permission
     */
    public committee_management_level_ids(cml: CML): Id[] {
        return (this as any)[`committee_$${cml}_management_level`] ?? [];
    }

    protected getDecimalFields(): (keyof User)[] {
        return [`vote_weight_$`, `default_vote_weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof User | { templateField: string })[] = [
        `id`,
        `username`,
        `pronoun`,
        `title`,
        `first_name`,
        `last_name`,
        `is_active`,
        `is_physical_person`,
        `default_password`,
        `can_change_own_password`,
        `gender`,
        `email`,
        `default_number`,
        `default_structure_level`,
        `default_vote_weight`,
        `last_email_sent`,
        `is_demo_user`,
        `last_login`,
        `organization_management_level`,
        `is_present_in_meeting_ids`,
        `committee_ids`,
        { templateField: `committee_$_management_level` },
        { templateField: `comment_$` },
        { templateField: `number_$` },
        { templateField: `structure_level_$` },
        { templateField: `about_me_$` },
        { templateField: `vote_weight_$` },
        { templateField: `group_$_ids` },
        { templateField: `speaker_$_ids` },
        { templateField: `personal_note_$_ids` },
        { templateField: `supported_motion_$_ids` },
        { templateField: `submitted_motion_$_ids` },
        { templateField: `poll_voted_$_ids` },
        { templateField: `option_$_ids` },
        { templateField: `vote_$_ids` },
        { templateField: `assignment_candidate_$_ids` },
        { templateField: `vote_delegated_$_to_id` },
        { templateField: `vote_delegations_$_from_ids` },
        { templateField: `chat_message_$_ids` },
        `poll_candidate_ids`,
        `meeting_ids`,
        `organization_id`
    ];
}
export interface User extends HasProjectionIds {}
