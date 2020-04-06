import { Id } from 'app/core/definitions/key-types';
import { BaseModelWithAgendaItemAndListOfSpeakers } from '../base/base-model-with-agenda-item-and-list-of-speakers';

/**
 * Representation of Motion.
 *
 * Slightly defined cause heavy maintenance on server side.
 *
 * @ignore
 */
export class Motion extends BaseModelWithAgendaItemAndListOfSpeakers<Motion> {
    public static COLLECTION = 'motion';

    public id: Id;
    public number: string;
    public sequential_number: number;
    public title: string;
    public text: string;
    public amendment_paragraphs: string[] | null; // TODO: structured field
    public modified_final_version: string;
    public reason: string;
    public category_weight: number;
    public state_extension: string;
    public recommendation_extension: string;
    public sort_weight: number;
    public created: number;
    public last_modified: number;

    public lead_motion_id: Id; // motion/amendment_ids;
    public amendment_ids: Id[]; // (motion/lead_motion_id)[];
    public sort_parent_id: Id; // motion/sort_child_ids;
    public sort_child_ids: Id[]; // (motion/parent_id)[];
    public origin_id: Id; // motion/derived_motion_ids; // Note: The related motions may not be in the same meeting
    public derived_motion_ids: Id[]; // (motion/origin_id)[]; // Note: The related motions may not be in the same meeting
    public state_id: Id; // motion_state/motion_ids;
    public workflow_id: Id; // motion_workflow/motion_ids;
    public recommendation_id: Id; // motion_state/motion_recommendation_ids;
    public category_id: Id; // category/motion_ids;
    public motion_block_id: Id; // motion_block/motion_ids;
    public submitter_ids: Id[]; // (motion_submitter/motion_id)[];
    public supporter_ids: Id[]; // (user/supported_motion_$<meeting_id>_ids)[];
    public poll_ids: Id[]; // (motion_poll/motion_id)[];
    public change_recommendation_ids: Id[]; // (motion_change_recommendation/motion_id)[];
    public statute_paragraph_id: Id; // motion_statute_paragraph/motion_ids;
    public comment_ids: Id[]; // (motion_comment/motion_id)[];
    public agenda_item_id: Id; // agenda_item/content_object_id;
    public list_of_speakers_id: Id; // list_of_speakers/content_object_id;
    public tag_ids: Id[]; // (tag/tagged_ids)[];
    public attachment_ids: Id[]; // (mediafile/attachment_ids)[];
    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public personal_note_ids: Id[]; // (personal_note/content_object_id)[];
    public meeting_id: Id; // meeting/motion_ids;

    public constructor(input?: any) {
        super(Motion.COLLECTION, input);
    }
}
