import { Id } from 'app/core/definitions/key-types';
import { BaseModel } from '../base/base-model';
import { HasAgendaItemId } from '../base/has-agenda-item-id';
import { HasAttachmentIds } from '../base/has-attachment-ids';
import { HasListOfSpeakersId } from '../base/has-list-of-speakers-id';
import { HasMeetingId } from '../base/has-meeting-id';
import { HasProjectableIds } from '../base/has-projectable-ids';
import { HasTagIds } from '../base/has-tag-ids';

/**
 * Representation of an assignment.
 * @ignore
 */
export class Assignment extends BaseModel<Assignment> {
    public static COLLECTION = 'assignment';

    public id: Id;
    public title: string;
    public description: string;
    public open_posts: number;
    public phase: number;
    public default_poll_description: string;
    public number_poll_candidates: boolean;

    public candidate_ids: Id[]; // (assignment_candidate/assignment_id)[];
    public poll_ids: Id[]; // (assignment_poll/assignment_id)[];

    public constructor(input?: any) {
        super(Assignment.COLLECTION, input);
    }
}
export interface Assignment
    extends HasMeetingId,
        HasProjectableIds,
        HasAttachmentIds,
        HasTagIds,
        HasAgendaItemId,
        HasListOfSpeakersId {}
