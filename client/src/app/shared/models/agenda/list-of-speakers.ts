import { BaseModelWithContentObject } from '../base/base-model-with-content-object';

/**
 * Representations of agenda Item
 * @ignore
 */
export class ListOfSpeakers extends BaseModelWithContentObject<ListOfSpeakers> {
    public static COLLECTION = 'list_of_speakers';

    public id: number;
    public closed: boolean;

    public content_object_id: string; // */list_of_speakers_id;
    public speaker_ids: number[]; // (speaker/list_of_speakers_id)[];
    public projection_ids: number[]; // (projection/element_id)[];
    public current_projector_ids: number[]; // (projector/current_element_ids)[]
    public meeting_id: number; // meeting/list_of_speakers_ids;

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }
}
