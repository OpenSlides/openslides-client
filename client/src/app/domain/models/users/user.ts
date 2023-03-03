import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { Id } from '../../definitions/key-types';
import { OMLMapping } from '../../definitions/organization-permission';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseDecimalModel } from '../base/base-decimal-model';
/**
 * Key to sort users by
 */
export type UserSortProperty = 'first_name' | 'last_name' | 'number';

/**
 * Iterable pre selection of genders (sexes)
 */
export const GENDERS = [_(`female`), _(`male`), _(`diverse`)];

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
    public readonly default_number!: string;
    public readonly default_structure_level!: string;
    public readonly email!: string;
    public readonly last_email_send!: number; // comes in seconds
    public readonly last_login!: number; // comes in seconds
    public readonly default_vote_weight!: number;
    public readonly is_demo_user!: boolean;

    // Meeting and committee
    public meeting_ids!: Id[]; // (meeting/user_ids)[];
    public is_present_in_meeting_ids!: Id[]; // (meeting/present_user_ids)[];
    public committee_ids!: Id[]; // (committee/user_ids)[];
    public meeting_user_ids!: Id[]; // (meeting_user/user_id);

    public poll_voted_$_ids!: string[]; // (poll/voted_ids)[];
    public vote_$_ids!: string[]; // (vote/user_id)[];
    public delegated_vote_$_ids!: string[]; // (vote/delegated_user_id)[];
    public option_$_ids!: string[];
    public organization_id!: Id; // organization/committee_ids;

    public current_projector_$_ids!: any[];

    public organization_management_level!: keyof OMLMapping;
    public committee_management_ids!: Id[];

    public constructor(input?: Partial<User>) {
        super(User.COLLECTION, input);
    }

    protected getDecimalFields(): (keyof User)[] {
        return [`default_vote_weight`];
    }
}
export interface User extends HasProjectionIds {}
