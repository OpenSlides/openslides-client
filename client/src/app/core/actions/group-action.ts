import { HasMeetingId } from 'app/shared/models/base/has-meeting-id';
import { Identifiable } from 'app/shared/models/base/identifiable';

export namespace GroupAction {
    export const CREATE = 'group.create';
    export const UPDATE = 'group.update';
    export const DELETE = 'group.delete';
    export const SET_PERMISSION = 'group.set_permission';

    export interface CreateParameters {
        name: string;
        permissions?: string;
    }
    export interface CreatePayload extends HasMeetingId, CreateParameters {}

    export interface UpdatePayload extends Identifiable {
        name?: string;
    }

    export interface DeletePayload extends Identifiable {}

    export interface SetPermissionPayload extends Identifiable {
        permission: string;
        set: boolean;
    }
}
