import { Fqid, Id } from '../../definitions/key-types';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { HasAttachmentIds } from '../../interfaces/has-attachment-ids';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasPersonalNoteIds } from '../../interfaces/has-personal-note-ids';
import { HasPollIds } from '../../interfaces/has-poll-ids';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasTagIds } from '../../interfaces/has-tag-ids';
import { BaseModel } from '../base/base-model';

export interface MotionFormattingRepresentation {
    text: string;
    modified_final_version: string;
    start_line_number: number;
}

export interface HasReferencedMotionInExtensionIds {
    referenced_in_motion_state_extension_ids: Id[]; // (motion/state_extension_reference_ids)[];
    referenced_in_motion_recommendation_extension_ids: Id[]; // (motion/recommendation_extension_reference_ids)[];
}

export interface AmendmentParagraphs {
    [index: number]: string;
}

/**
 * Representation of Motion.
 *
 * Slightly defined cause heavy maintenance on server side.
 *
 * @ignore
 */
export class Motion extends BaseModel<Motion> implements MotionFormattingRepresentation {
    public static COLLECTION = `motion`;

    public number!: string;
    public sequential_number!: number;
    public title!: string;
    public text!: string;
    public modified_final_version!: string;
    public reason!: string;
    public category_weight!: number;
    public state_extension!: string;
    public recommendation_extension!: string;
    public sort_weight!: number;
    /**
     * Client-calculated field: The tree_weight indicates the position of a motion in a list of
     * motions in regard to the call list.
     */
    public tree_weight!: number;
    public created!: number;
    public workflow_timestamp!: number;
    public forwarded!: number; // It's a timestamp
    public last_modified!: number;
    public start_line_number!: number;
    public amendment_paragraph_$!: number[];

    public lead_motion_id!: Id; // motion/amendment_ids;
    public amendment_ids!: Id[]; // (motion/lead_motion_id)[];
    public sort_parent_id!: Id; // motion/sort_child_ids;
    public sort_child_ids!: Id[]; // (motion/parent_id)[];
    // Note: The related motions in origin_id/derived_motion_ids may not be in the same meeting
    public origin_id: Id; // motion/derived_motion_ids;
    public origin_meeting_id: Id;
    public derived_motion_ids!: Id[]; // motion/all_origin_ids;
    public all_derived_motion_ids!: Id[]; // (motion/origin_id)[];
    public all_origin_ids!: Id[]; // motion/all_derived_motion_ids;
    public state_id!: Id; // motion_state/motion_ids;
    public recommendation_id!: Id; // motion_state/motion_recommendation_ids;
    public state_extension_reference_ids!: Fqid[]; // (*/referenced_in_motion_state_extension_ids)[];
    public recommendation_extension_reference_ids!: Fqid[]; // (*/referenced_in_motion_recommendation_extension_ids)[];
    // current option: motion
    public category_id!: Id; // category/motion_ids;
    public block_id!: Id; // block/motion_ids;
    public submitter_ids!: Id[]; // (motion_submitter/motion_id)[];
    public supporter_ids!: Id[]; // (user/supported_motion_$<meeting_id>_ids)[];
    public poll_ids!: Id[]; // (motion_poll/motion_id)[];
    public change_recommendation_ids!: Id[]; // (motion_change_recommendation/motion_id)[];
    public statute_paragraph_id!: Id; // motion_statute_paragraph/motion_ids;
    public comment_ids!: Id[]; // (motion_comment/motion_id)[];

    public get firstLine(): number {
        return this.start_line_number || 1;
    }

    public constructor(input?: any) {
        super(Motion.COLLECTION, input);
    }

    public amendment_paragraph(paragraphNumber: number): string | null {
        return ((this as any)[`amendment_paragraph_$${paragraphNumber}`] as string) ?? null;
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Motion | { templateField: string })[] = [
        `id`,
        `number`,
        `sequential_number`,
        `title`,
        `text`,
        { templateField: `amendment_paragraph_$` },
        `modified_final_version`,
        `reason`,
        `category_weight`,
        `state_extension`,
        `recommendation_extension`,
        `sort_weight`,
        `created`,
        `last_modified`,
        `workflow_timestamp`,
        `start_line_number`,
        `forwarded`,
        `lead_motion_id`,
        `amendment_ids`,
        `sort_parent_id`,
        `sort_child_ids`,
        `origin_id`,
        `origin_meeting_id`,
        `derived_motion_ids`,
        `all_origin_ids`,
        `all_derived_motion_ids`,
        `state_id`,
        `recommendation_id`,
        `state_extension_reference_ids`,
        `referenced_in_motion_state_extension_ids`,
        `recommendation_extension_reference_ids`,
        `referenced_in_motion_recommendation_extension_ids`,
        `category_id`,
        `block_id`,
        `submitter_ids`,
        `supporter_ids`,
        `poll_ids`,
        `change_recommendation_ids`,
        `statute_paragraph_id`,
        `comment_ids`,
        `agenda_item_id`,
        `list_of_speakers_id`,
        `tag_ids`,
        `attachment_ids`,
        `projection_ids`,
        `personal_note_ids`,
        `meeting_id`
    ];
}
export interface Motion
    extends HasMeetingId,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasTagIds,
        HasAttachmentIds,
        HasPersonalNoteIds,
        HasProjectionIds,
        HasReferencedMotionInExtensionIds,
        HasPollIds {}
