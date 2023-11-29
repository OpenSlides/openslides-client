import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

/**
 * Representation of structure_level_list_of_speakers
 */
export class StructureLevelListOfSpeakers extends BaseModel<StructureLevelListOfSpeakers> {
    public static COLLECTION = `structure_level_list_of_speakers`;

    public readonly initial_time!: number;
    public readonly additional_time: number;
    public readonly remaining_time: number;
    public readonly current_start_time: number;

    // Relations
    public structure_level_id!: Id; // structure_level/structure_level_list_of_speakers_ids
    public list_of_speakers_id!: Id; // list_of_speakers/structure_level_list_of_speakers_ids
    public speaker_ids: Id[]; // speaker/structure_level_list_of_speakers_id

    public static readonly REQUESTABLE_FIELDS: (keyof StructureLevelListOfSpeakers)[] = [
        `id`,
        `structure_level_id`,
        `list_of_speakers_id`,
        `speaker_ids`,
        `initial_time`,
        `additional_time`,
        `remaining_time`,
        `current_start_time`,
        `meeting_id`
    ];
}
export interface StructureLevelListOfSpeakers extends HasMeetingId {}
