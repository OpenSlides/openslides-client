import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../base/base-model';
import { HasAgendaItemId } from '../base/has-agenda-item-id';
import { HasListOfSpeakersId } from '../base/has-list-of-speakers-id';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectionIds } from '../base/has-projectable-ids';
import { HasSequentialNumber } from '../base/has-sequential-number';

/**
 * Representation of a motion block.
 * @ignore
 */
export class MotionBlock extends BaseModel<MotionBlock> {
    public static COLLECTION = `motion_block`;

    public id: Id;
    public title: string;
    public internal: boolean;

    public motion_ids: Id[]; // (motion/block_id)[];

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
