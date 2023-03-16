import { Id } from '../../definitions/key-types';
import { HasSequentialNumber } from '../../interfaces';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a motion block.
 * @ignore
 */
export class MotionBlock extends BaseModel<MotionBlock> {
    public static COLLECTION = `motion_block`;

    public title!: string;
    public internal!: boolean;

    public motion_ids!: Id[]; // (motion/block_id)[];

    public constructor(input?: any) {
        super(MotionBlock.COLLECTION, input);
    }

    public static readonly DEFAULT_FIELDSET: (keyof MotionBlock)[] = [
        `id`,
        `title`,
        `internal`,
        `sequential_number`,
        `motion_ids`,
        `agenda_item_id`,
        `list_of_speakers_id`,
        `projection_ids`,
        `meeting_id`
    ];
}
export interface MotionBlock
    extends HasMeetingId,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasProjectionIds,
        HasSequentialNumber {}
