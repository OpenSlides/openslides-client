import { BaseModel } from '../base/base-model';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasSequentialNumber } from '../../interfaces';

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
}
export interface MotionBlock
    extends HasMeetingId,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasProjectionIds,
        HasSequentialNumber {}
