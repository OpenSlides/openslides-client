import { BaseModelWithAgendaItemAndListOfSpeakers } from '../base/base-model-with-agenda-item-and-list-of-speakers';

/**
 * Representation of an assignment.
 * @ignore
 */
export class Assignment extends BaseModelWithAgendaItemAndListOfSpeakers<Assignment> {
    public static COLLECTION = 'assignment';

    public id: number;
    public title: string;
    public description: string;
    public open_posts: number;
    public phase: number;
    public default_poll_description: string;
    public number_poll_candidates: boolean;

    public assignment_candidate_ids: number[]; // (assignment_candidate/assignment_id)[];
    public poll_ids: number[]; // (assignment_poll/assignment_id)[];
    public agenda_item_id: number; // agenda_item/content_object_id;
    public list_of_speakers_id: number; // list_of_speakers/content_object_id;
    public tag_ids: number[]; // (tag/tagged_ids)[];
    public attachment_ids: number[]; // (mediafile/attachment_ids)[];
    public projection_ids: number[]; // (projection/element_id)[];
    public current_projector_ids: number[]; // (projector/current_element_ids)[]
    public meeting_id: number; // meeting/assignment_ids;

    public constructor(input?: any) {
        super(Assignment.COLLECTION, input);
    }
}
