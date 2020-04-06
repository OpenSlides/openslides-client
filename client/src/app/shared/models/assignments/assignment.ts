import { Id } from 'app/core/definitions/key-types';
import { BaseModelWithAgendaItemAndListOfSpeakers } from '../base/base-model-with-agenda-item-and-list-of-speakers';

/**
 * Representation of an assignment.
 * @ignore
 */
export class Assignment extends BaseModelWithAgendaItemAndListOfSpeakers<Assignment> {
    public static COLLECTION = 'assignment';

    public id: Id;
    public title: string;
    public description: string;
    public open_posts: number;
    public phase: number;
    public default_poll_description: string;
    public number_poll_candidates: boolean;

    public assignment_candidate_ids: Id[]; // (assignment_candidate/assignment_id)[];
    public poll_ids: Id[]; // (assignment_poll/assignment_id)[];
    public agenda_item_id?: Id; // agenda_item/content_object_id;
    public list_of_speakers_id?: Id; // list_of_speakers/content_object_id;
    public tag_ids: Id[]; // (tag/tagged_ids)[];
    public attachment_ids: Id[]; // (mediafile/attachment_ids)[];
    public projection_ids: Id[]; // (projection/element_id)[];
    public current_projector_ids: Id[]; // (projector/current_element_ids)[]
    public meeting_id: Id; // meeting/assignment_ids;

    public constructor(input?: any) {
        super(Assignment.COLLECTION, input);
    }
}
