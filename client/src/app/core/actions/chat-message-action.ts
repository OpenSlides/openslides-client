import { Identifiable } from '../../shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace ChatMessageAction {
    export const CREATE = `chat_message.create`;
    export const UPDATE = `chat_message.update`;
    export const DELETE = `chat_message.delete`;

    export interface CreatePayload extends PartialPayload {
        chat_group_id: Id;
    }

    export interface UpdatePayload extends Identifiable, Partial<PartialPayload> {}

    export interface DeletePayload extends Identifiable {}

    interface PartialPayload {
        content: UnsafeHtml;
    }
}
