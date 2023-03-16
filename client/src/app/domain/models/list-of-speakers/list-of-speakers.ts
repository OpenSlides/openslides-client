import { Fqid, Id } from '../../definitions/key-types';
import { HasSequentialNumber } from '../../interfaces';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseModel } from '../base/base-model';

/**
 * Representations of agenda Item
 * @ignore
 */
export class ListOfSpeakers extends BaseModel<ListOfSpeakers> {
    public static COLLECTION = `list_of_speakers`;

    public closed!: boolean;

    public content_object_id!: Fqid; // */list_of_speakers_id;
    public speaker_ids!: Id[]; // (speaker/list_of_speakers_id)[];

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }

    public static readonly DEFAULT_FIELDSET: (keyof ListOfSpeakers)[] = [
        `id`,
        `closed`,
        `sequential_number`,
        `content_object_id`,
        `speaker_ids`,
        `projection_ids`,
        `meeting_id`
    ];
}
export interface ListOfSpeakers extends HasMeetingId, HasProjectionIds, HasSequentialNumber {}
