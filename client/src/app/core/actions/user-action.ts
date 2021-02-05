import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Decimal, Id, UnsafeHtml } from '../definitions/key-types';

export namespace UserAction {
    export const CREATE = 'user.create';
    export const UPDATE = 'user.update';
    export const DELETE = 'user.delete';
    export const CREATE_TEMPORARY = 'user.create_temporary';
    export const UPDATE_TEMPORARY = 'user.update_temporary';
    export const DELETE_TEMPORARY = 'user.delete_temporary';
    export const SET_PASSWORD_SELF = 'user.set_password_self';
    export const SET_PASSWORD = 'user.set_password';
    export const SET_PASSWORD_TEMPORARY = 'user.set_password_temporary';
    export const UPDATE_SELF = 'user.update_self';
    export const MERGE_TO_NON_TEMPORARY = 'user.merge_to_non_temporary';
    export const RESET_PASSWORD_TO_DEFAULT = 'user.reset_password_to_default';
    export const RESET_PASSWORD_TO_DEFAULT_TEMPORARY = 'user.reset_password_to_default_temporary';
    export const GENERATE_NEW_PASSWORD = 'user.generate_new_password';
    export const GENERATE_NEW_PASSWORD_TEMPORARY = 'user.generate_new_password_temporary';

    export interface CommonUserPayload {
        // Optional:
        title?: string;
        first_name?: string;
        last_name?: string;
        is_active?: boolean;
        is_physical_person?: boolean;
        gender?: string;
        email?: string;
        vote_weight?: Decimal;

        is_present_in_meeting_ids?: Id[]; // can only contain the given meeting_id
    }

    interface TemporaryUserPayload extends CommonUserPayload {
        // Optional
        default_password?: string;
        vote_delegations_from_ids?: Id[];
        comment?: string;
        number?: string;
        structure_level?: string;
        about_me?: UnsafeHtml;
        group_ids?: Id[]; // the structured field is only valid for the meeting_id
    }

    interface UserPayload extends CommonUserPayload {
        role_id?: Id;
        guest_meeting_ids?: Id[];
        committee_as_member_ids?: Id[];
        committee_as_manager_ids?: Id[];
        vote_delegations_from_ids?: {
            [meeting_id: number]: Id[];
        };
        comment_$?: {
            [meeting_id: number]: UnsafeHtml;
        };
        number_$?: {
            [meeting_id: number]: string;
        };
        structure_level_$?: {
            [meeting_id: number]: string;
        };
        about_me_$?: {
            [meeting_id: number]: UnsafeHtml;
        };
        group_$_ids?: {
            [meeting_id: number]: string[] | Id[];
        };
        vote_delegations_$_from_ids?: {
            [meeting_id: number]: Id[];
        };
    }

    interface PartialSetPasswordPayload {
        id: Id;
        password: string;
        // Optional
        set_as_default?: boolean;
    }

    export interface CreatePayload extends UserPayload {
        username: string;
    }

    export interface UpdatePayload extends Identifiable, UserPayload {
        username?: string;
    }
    export interface DeletePayload extends Identifiable {}

    export interface DeletePayload extends Identifiable {}

    export interface CreateTemporaryPayload extends HasMeetingId, TemporaryUserPayload {
        // Required:
        username: string;
    }
    export interface UpdateTemporaryPayload extends Identifiable, TemporaryUserPayload {
        // Optional:
        username?: string;
    }
    export interface DeleteTemporaryPayload extends Identifiable {}
    export interface SetPasswordSelfPayload {
        old_password: string;
        new_password: string;
    }
    export interface UpdateSelfPayload {
        username: string;
        about_me: UnsafeHtml;
        email: string;
    }
    export interface MergeToNonTemporaryPayload {}
    export interface SetPasswordTemporaryPayload extends PartialSetPasswordPayload {}
    export interface ResetPasswordToDefaultTemporaryPayload extends Identifiable {}
    export interface SetPasswordPayload extends PartialSetPasswordPayload {}
    export interface ResetPasswordToDefaultPayload extends Identifiable {}
    export interface GenerateNewPassword extends Identifiable {}
    export interface GenerateNewPasswordTemporary extends Identifiable {}
}
