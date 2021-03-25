import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace ProjectorMessageAction {
    export const CREATE = 'projector_message.create';
    export const UPDATE = 'projector_message.update';
    export const DELETE = 'projector_message.delete';

    export interface CreatePayload {
        meeting_id: Id;
        message: string;
    }

    export interface UpdatePayload extends Identifiable {
        message?: string;
    }

    export interface DeletePayload extends Identifiable {}
}
