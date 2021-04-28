import { SpeechState } from 'app/shared/models/agenda/speaker';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id, UnsafeHtml } from '../definitions/key-types';

export namespace SpeakerAction {
    export const CREATE = 'speaker.create';
    export const UPDATE = 'speaker.update';
    export const DELETE = 'speaker.delete';
    export const START_SPEAK = 'speaker.speak';
    export const END_SPEAK = 'speaker.end_speech';
    export const SORT_SPEAKERS = 'speaker.sort';

    interface BasePayload {
        speech_state: SpeechState;
    }

    export interface CreatePayload extends Partial<BasePayload> {
        list_of_speakers_id: Id;
        user_id: Id;

        point_of_order?: boolean;
        note?: UnsafeHtml;
    }

    export interface UpdatePayload extends Identifiable, BasePayload {}

    export interface DeletePayload extends Identifiable {}

    export interface SpeakPayload extends Identifiable {}
    export interface EndSpeachPayload extends Identifiable {}
    export interface SortPayload {
        list_of_speakers_id: Id;
        speaker_ids: Id[];
    }
}
