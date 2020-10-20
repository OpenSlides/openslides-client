import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace SpeakerAction {
    export const CREATE = 'speaker.create';
    export const UPDATE = 'speaker.update';
    export const DELETE = 'speaker.delete';
    export const SPEAK = 'speaker.speak';

    export interface CreatePayload {
        list_of_speakers_id: Id;
        user_id: Id;
        marked?: boolean;
    }

    export interface UpdatePayload extends Identifiable {
        marked?: boolean;
    }

    export interface SpeakPayload extends Identifiable {}
}
