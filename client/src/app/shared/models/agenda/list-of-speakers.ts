import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';

/**
 * Representations of agenda Item
 * @ignore
 */
export class ListOfSpeakers extends BaseModel<ListOfSpeakers> {
    public static COLLECTION = 'list_of_speakers';

    public id: Id;
    public closed: boolean;

    public content_object_id: Fqid; // */list_of_speakers_id;
    public speaker_ids: Id[]; // (speaker/list_of_speakers_id)[];
    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public meeting_id: Id; // meeting/list_of_speakers_ids;

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }
}
