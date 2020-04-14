import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasProjectableIds } from '../base/has-projectable-ids';

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
    public meeting_id: Id; // meeting/list_of_speakers_ids;

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }
}
export interface ListOfSpeakers extends HasProjectableIds {}
