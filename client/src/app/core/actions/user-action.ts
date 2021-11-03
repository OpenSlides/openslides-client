import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

import { Decimal, Id, UnsafeHtml } from '../definitions/key-types';

export namespace UserAction {
    export const CREATE = `user.create`;
    export const DELETE = `user.delete`;
    export const GENERATE_NEW_PASSWORD = `user.generate_new_password`;
    export const RESET_PASSWORD_TO_DEFAULT = `user.reset_password_to_default`;
    export const SEND_INVITATION_EMAIL = `user.send_invitation_email`;
    export const SET_PASSWORD = `user.set_password`;
    export const SET_PASSWORD_SELF = `user.set_password_self`;
    export const SET_PRESENT = `user.set_present`;
    export const UPDATE = `user.update`;
    export const UPDATE_SELF = `user.update_self`;
    export const TOGGLE_PRESENCE_BY_NUMBER = `user.toggle_presence_by_number`;

    export interface BaseUserPayload {
        title: string;
        first_name: string;
        last_name: string;
        username: string;
        is_active: boolean;
        is_physical_person: boolean;
        default_password: string;
        gender: string;
        email: string;

        default_structure_level: string;
        default_number: string;
        default_vote_weight: Decimal;

        number_$: {
            [meeting_id: number]: string;
        };
        structure_level_$: {
            [meeting_id: number]: string;
        };
        vote_weight_$: {
            [meeting_id: number]: Decimal;
        };
        about_me_$: {
            [meeting_id: number]: UnsafeHtml;
        };
        comment_$: {
            [meeting_id: number]: UnsafeHtml;
        };

        vote_delegated_$_to_id: {
            [meeting_id: number]: Id;
        };
        vote_delegations_$_from_ids: {
            [meeting_id: number]: Id[];
        };

        group_$_ids: {
            [meeting_id: number]: Id[];
        };

        committee_ids: Id[];
        committee_$_management_level: string;
        organization_management_level: string;
    }

    export interface CreatePayload extends Partial<BaseUserPayload> {
        is_present_in_meeting_ids?: Id[];
    }
    export interface UpdatePayload extends Partial<BaseUserPayload>, Identifiable {}
    export interface DeletePayload extends Identifiable {}

    export interface GenerateNewPasswordPayload extends Identifiable {}
    export interface ResetPasswordToDefaultPayload extends Identifiable {}
    export interface SendInvitationEmailPayload extends Identifiable, HasMeetingId {}

    export interface SetPasswordPayload extends Identifiable {
        password: string;
        // Optional
        set_as_default?: boolean;
    }

    export interface SetPasswordSelfPayload {
        old_password: string;
        new_password: string;
    }

    export interface SetPresentPayload extends Identifiable {
        meeting_id: Id;
        present: boolean;
    }

    export interface UpdateSelfPayload {
        username: string;
        about_me_$: {
            [meeting_id: number]: UnsafeHtml;
        };
        email: string;
    }

    export interface TogglePresenceByNumberPayload {
        number: string;
        meeting_id: Id;
    }
}
