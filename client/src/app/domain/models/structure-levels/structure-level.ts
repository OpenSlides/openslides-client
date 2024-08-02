import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

/**
 *  Representation of a structure_level
 *  @ignore
 */
export class StructureLevel extends BaseModel<StructureLevel> {
    public static COLLECTION = `structure_level`;

    public readonly name!: string;
    public readonly color: string;
    public readonly default_time: number;

    // Relations
    public meeting_id!: Id;
    public meeting_user_ids!: Id[];
    public structure_level_list_of_speakers_ids: Id[];

    public constructor(input?: Partial<StructureLevel>) {
        super(StructureLevel.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof StructureLevel)[] = [
        `id`,
        `name`,
        `color`,
        `default_time`,
        `meeting_user_ids`,
        `structure_level_list_of_speakers_ids`,
        `meeting_id`
    ];
}
export interface StructureLevel extends HasMeetingId {}
