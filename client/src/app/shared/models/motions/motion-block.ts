import { Id } from 'app/core/definitions/key-types';
import { BaseModelWithAgendaItemAndListOfSpeakers } from '../base/base-model-with-agenda-item-and-list-of-speakers';

/**
 * Representation of a motion block.
 * @ignore
 */
export class MotionBlock extends BaseModelWithAgendaItemAndListOfSpeakers<MotionBlock> {
    public static COLLECTION = 'motion_block';

    public id: Id;
    public title: string;
    public internal: boolean;

    public motion_ids: Id[]; // (motion/motion_block_id)[];
    public agenda_item_id: Id; // agenda_item/content_object_id;
    public list_of_speakers_id: Id; // list_of_speakers/content_object_id;
    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public meeting_id: Id; // meeting/motion_block_ids;

    public constructor(input?: any) {
        super(MotionBlock.COLLECTION, input);
    }
}
