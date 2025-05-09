import { _ } from '@ngx-translate/core';

import { Id } from '../../definitions/key-types';
import { OMLMapping } from '../../definitions/organization-permission';
import { BaseDecimalModel } from '../base/base-decimal-model';
/**
 * Key to sort users by
 */
export type UserSortProperty = `first_name` | `last_name` | `number`;

/**
 * Iterable pre selection of genders
 */
export const GENDERS = [_(`female`), _(`male`), _(`diverse`), _(`non-binary`)];
export const GENDER_FITLERABLE = [`female`, `male`, `diverse`, `non-binary`];

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
    public readonly email!: string;
    public readonly last_email_sent!: number; // comes in seconds
    public readonly last_login!: number; // comes in seconds
    public readonly default_vote_weight!: number;
    public readonly is_demo_user!: boolean;
    public readonly saml_id!: string;
    public readonly member_number!: string;

    // Meeting and committee
    public meeting_ids!: Id[]; // (meeting/user_ids)[];
    public is_present_in_meeting_ids!: Id[]; // (meeting/present_user_ids)[];
    public committee_ids!: Id[]; // (committee/user_ids)[];
    public meeting_user_ids!: Id[]; // (meeting_user/user_id);

    public poll_voted_ids!: string[]; // (poll/voted_ids)[];
    public vote_ids!: string[]; // (vote/user_id)[];
    public option_ids!: string[];
    public poll_candidate_ids!: Id[]; // (poll_candidate/user_id);
    public organization_id!: Id; // organization/committee_ids;

    public organization_management_level!: keyof OMLMapping;
    public committee_management_ids!: Id[];
    public gender_id: Id; // (gender/user_ids)[]

    public constructor(input?: Partial<User>) {
        super(User.COLLECTION, input);
    }

    protected getDecimalFields(): (keyof User)[] {
        return [`default_vote_weight`];
    }

    public static readonly REQUESTABLE_FIELDS: (keyof User)[] = [
        `id`,
        `username`,
        `member_number`,
        `saml_id`,
        `pronoun`,
        `title`,
        `first_name`,
        `last_name`,
        `is_active`,
        `is_physical_person`,
        `default_password`,
        `can_change_own_password`,
        `email`,
        `default_vote_weight`,
        `last_email_sent`,
        `is_demo_user`,
        `last_login`,
        `gender_id`,
        `organization_management_level`,
        `is_present_in_meeting_ids`,
        `committee_ids`,
        `committee_management_ids`,
        `meeting_user_ids`,
        `poll_voted_ids`,
        `option_ids`,
        `vote_ids`,
        `poll_candidate_ids`,
        `meeting_ids`,
        `organization_id`
    ];
}
export interface User {
    readonly username: string;
    readonly title: string;
    readonly pronoun: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly is_active: boolean;
    readonly is_physical_person: boolean;
    readonly default_password: string;
    readonly can_change_own_password: boolean;
    readonly email: string;
    readonly last_email_sent: number; // comes in seconds
    readonly last_login: number; // comes in seconds
    readonly default_vote_weight: number;
    readonly is_demo_user: boolean;
    readonly saml_id: string;
    readonly member_number: string;

    // Meeting and committee
    meeting_ids: Id[]; // (meeting/user_ids)[];
    is_present_in_meeting_ids: Id[]; // (meeting/present_user_ids)[];
    committee_ids: Id[]; // (committee/user_ids)[];
    meeting_user_ids: Id[]; // (meeting_user/user_id);

    poll_voted_ids: string[]; // (poll/voted_ids)[];
    vote_ids: string[]; // (vote/user_id)[];
    option_ids: string[];
    poll_candidate_ids: Id[]; // (poll_candidate/user_id);
    organization_id: Id; // organization/committee_ids;

    organization_management_level: keyof OMLMapping;
    committee_management_ids: Id[];
    gender_id: Id; // (gender/user_ids)[]
}
