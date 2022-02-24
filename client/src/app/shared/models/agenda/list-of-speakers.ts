import { Fqid, Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectionIds } from '../base/has-projectable-ids';
import { HasSequentialNumber } from '../base/has-sequential-number';

/**
 * Representations of agenda Item
 * @ignore
 */
export class ListOfSpeakers extends BaseModel<ListOfSpeakers> {
    public static COLLECTION = `list_of_speakers`;

    public id: Id;
    public closed: boolean;

    public content_object_id: Fqid; // */list_of_speakers_id;
    public speaker_ids: Id[]; // (speaker/list_of_speakers_id)[];

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }
}
export interface ListOfSpeakers extends HasMeetingId, HasProjectionIds, HasSequentialNumber {}
