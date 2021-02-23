import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace ProjectorMessageAction {
    export const CREATE = 'projector.create';
    export const UPDATE = 'projector.update';
    export const DELETE = 'projector.delete';

    export interface CreatePayload {
        meeting_id: Id;
        message: string;
    }

    export interface UpdatePayload extends Identifiable {
        message?: string;
    }

    export interface DeletePayload extends Identifiable {}
}
