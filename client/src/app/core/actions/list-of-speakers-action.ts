import { Identifiable } from 'app/shared/models/base/identifiable';

export namespace ListOfSpeakersAction {
    export const UPDATE = 'list_of_speakers.update';
    export const DELETE_ALL_SPEAKERS = 'list_of_speakers.delete_all_speakers';
    export const RE_ADD_LAST_SPEAKER = 'list_of_speakers.re_add_last';

    export interface UpdatePayload extends Identifiable {
        closed?: boolean;
    }
    export interface DeleteAllSpeakersPayload extends Identifiable {}
    export interface ReAddLastPayload extends Identifiable {}
}
