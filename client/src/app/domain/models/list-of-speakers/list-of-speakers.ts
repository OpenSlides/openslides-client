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

    public moderator_notes: string;

    public content_object_id!: Fqid; // */list_of_speakers_id;
    public speaker_ids!: Id[]; // (speaker/list_of_speakers_id)[];

    public structure_level_list_of_speakers_ids: Id[]; // (structure_level_list_of_speakers/list_of_speakers_id)[];

    public constructor(input?: any) {
        super(ListOfSpeakers.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof ListOfSpeakers)[] = [
        `id`,
        `closed`,
        `sequential_number`,
        `moderator_notes`,
        `content_object_id`,
        `speaker_ids`,
        `structure_level_list_of_speakers_ids`,
        `projection_ids`,
        `meeting_id`
    ];
}
export interface ListOfSpeakers extends HasMeetingId, HasProjectionIds, HasSequentialNumber {}
