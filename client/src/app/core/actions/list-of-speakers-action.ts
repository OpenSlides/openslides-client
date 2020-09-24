import { Identifiable } from 'app/shared/models/base/identifiable';
import { Id } from '../definitions/key-types';

export namespace ListOfSpeakersAction {
    export interface UpdatePayload extends Identifiable {
        closed?: boolean;
    }
    export interface MarkSpeakerPayload {}
    export interface StopCurrentSpeakerPayload extends Identifiable {}
    export interface DeleteAllSpeakersPayload extends Identifiable {}
    export interface DeleteAllSpeakersOfAllListsPayload {}
    export interface SortPayload extends Identifiable {
        speaker_ids: Id[];
    }
    export interface PrunePayload extends Identifiable {}
    export interface ReAddLastPayload extends Identifiable {}
    export interface NextSpeechPayload extends Identifiable {}
}
