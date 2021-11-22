import { HasMeetingId } from '../../shared/models/base/has-meeting-id';
import { Identifiable } from '../../shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace ChatGroupAction {
    export const CREATE = `chat_group.create`;
    export const UPDATE = `chat_group.update`;
    export const DELETE = `chat_group.delete`;
    export const SORT = `chat_group.sort`;
    export const CLEAR = `chat_group.clear`;

    export interface CreatePayload extends PartialPayload {}

    export interface UpdatePayload extends Partial<PartialPayload>, Identifiable {}

    export interface DeletePayload extends Identifiable {}

    export interface SortPayload extends HasMeetingId {
        chat_group_ids: Id[];
    }

    export interface ClearPayload extends Identifiable {}

    interface PartialPayload {
        name: string;
        read_group_ids?: Id[];
        write_group_ids?: Id[];
        weight?: number;
    }
}
