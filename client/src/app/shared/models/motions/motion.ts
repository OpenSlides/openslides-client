import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasAgendaItemId } from '../base/has-agenda-item-id';
import { HasAttachmentIds } from '../base/has-attachment-ids';
import { HasListOfSpeakersId } from '../base/has-list-of-speakers-id';
import { HasPersonalNoteIds } from '../base/has-personal-note-ids';
import { HasProjectableIds } from '../base/has-projectable-ids';
import { HasTagIds } from '../base/has-tag-ids';

export interface HasReferencedMotionInRecommendationExtensionIds {
    referenced_in_motion_recommendation_extension_ids: Id[]; // (motion/recommendation_extension_reference_ids)[];
}

/**
 * Representation of Motion.
 *
 * Slightly defined cause heavy maintenance on server side.
 *
 * @ignore
 */
export class Motion extends BaseModel<Motion> {
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
    public derived_motion_ids: Id[]; // (motion/origin_id)[]; Note: The related motions may not be in the same meeting
    public forwarding_tree_motion_ids: Id[]; // Calculated: All children (derived_motion_ids),
    // grand children, ... and all parents (origin_id).
    public state_id: Id; // motion_state/motion_ids;
    public workflow_id: Id; // motion_workflow/motion_ids;
    public recommendation_id: Id; // motion_state/motion_recommendation_ids;
    public recommendation_extension_reference_ids: Fqid[]; // (*/referenced_in_motion_recommendation_extension_ids)[];
    // current option: motion
    public category_id: Id; // category/motion_ids;
    public block_id: Id; // block/motion_ids;
    public submitter_ids: Id[]; // (motion_submitter/motion_id)[];
    public supporter_ids: Id[]; // (user/supported_motion_$<meeting_id>_ids)[];
    public poll_ids: Id[]; // (motion_poll/motion_id)[];
    public change_recommendation_ids: Id[]; // (motion_change_recommendation/motion_id)[];
    public statute_paragraph_id: Id; // motion_statute_paragraph/motion_ids;
    public comment_ids: Id[]; // (motion_comment/motion_id)[];
    public meeting_id: Id; // meeting/motion_ids;

    public constructor(input?: any) {
        super(Motion.COLLECTION, input);
    }
}
export interface Motion
    extends HasAgendaItemId,
        HasListOfSpeakersId,
        HasTagIds,
        HasAttachmentIds,
        HasPersonalNoteIds,
        HasProjectableIds,
        HasReferencedMotionInRecommendationExtensionIds {}
