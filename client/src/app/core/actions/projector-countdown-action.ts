import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace ProjectorCountdownAction {
    export const CREATE = 'projector_countdown.create';
    export const UPDATE = 'projector_countdown.update';
    export const DELETE = 'projector_countdown.delete';

    export interface CreatePayload {
        meeting_id: Id;
        title: string;

        description?: string;
        default_time?: number;
    }

    export interface UpdatePayload extends Identifiable {
        title?: string;
        description?: string;
        default_time?: number;
        countdown_time?: number;
        running?: boolean;
    }

    export interface DeletePayload extends Identifiable {}
}
