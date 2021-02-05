import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace SpeakerAction {
    export const CREATE = 'speaker.create';
    export const UPDATE = 'speaker.update';
    export const DELETE = 'speaker.delete';
    export const START_SPEAK = 'speaker.speak';
    export const END_SPEAK = 'speaker.end_speech';
    export const SORT_SPEAKERS = 'speaker.sort';

    export interface CreatePayload {
        list_of_speakers_id: Id;
        user_id: Id;
        marked?: boolean;
        point_of_order?: boolean;
    }

    export interface UpdatePayload extends Identifiable {
        marked?: boolean;
    }

    export interface SpeakPayload extends Identifiable {}
    export interface EndSpeachPayload extends Identifiable {}
    export interface SortPayload {
        list_of_speakers_id: Id;
        speaker_ids: Id[];
    }
}
