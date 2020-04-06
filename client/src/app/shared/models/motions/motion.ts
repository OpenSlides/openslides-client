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

    public id: number;
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

    public lead_motion_id: number; // motion/amendment_ids;
    public amendment_ids: number[]; // (motion/lead_motion_id)[];
    public sort_parent_id: number; // motion/sort_child_ids;
    public sort_child_ids: number[]; // (motion/parent_id)[];
    public origin_id: number; // motion/derived_motion_ids; // Note: The related motions may not be in the same meeting
    public derived_motion_ids: number[]; // (motion/origin_id)[]; // Note: The related motions may not be in the same meeting
    public state_id: number; // motion_state/motion_ids;
    public workflow_id: number; // motion_workflow/motion_ids;
    public recommendation_id: number; // motion_state/motion_recommendation_ids;
    public category_id: number; // category/motion_ids;
    public motion_block_id: number; // motion_block/motion_ids;
    public submitter_ids: number[]; // (motion_submitter/motion_id)[];
    public supporter_ids: number[]; // (user/supported_motion_$<meeting_id>_ids)[];
    public poll_ids: number[]; // (motion_poll/motion_id)[];
    public change_recommendation_ids: number[]; // (motion_change_recommendation/motion_id)[];
    public statute_paragraph_id: number; // motion_statute_paragraph/motion_ids;
    public comment_ids: number[]; // (motion_comment/motion_id)[];
    public agenda_item_id: number; // agenda_item/content_object_id;
    public list_of_speakers_id: number; // list_of_speakers/content_object_id;
    public tag_ids: number[]; // (tag/tagged_ids)[];
    public attachment_ids: number[]; // (mediafile/attachment_ids)[];
    public projection_ids: number[]; // (projection/element_id)[];
    public current_projector_ids: number[]; // (projector/current_element_ids)[]
    public personal_note_ids: number[]; // (personal_note/content_object_id)[];
    public meeting_id: number; // meeting/motion_ids;

    public constructor(input?: any) {
        super(Motion.COLLECTION, input);
    }
}
