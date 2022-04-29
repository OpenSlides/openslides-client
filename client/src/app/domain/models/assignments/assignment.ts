import { BaseModel } from '../base/base-model';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasAttachmentIds } from '../../interfaces/has-attachment-ids';
import { HasTagIds } from '../../interfaces/has-tag-ids';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { AssignmentPhase } from './assignment-phase';
import { HasSequentialNumber } from '../../interfaces';

/**
 * Representation of an assignment.
 * @ignore
 */
export class Assignment extends BaseModel<Assignment> {
    public static COLLECTION = `assignment`;

    public title!: string;
    public description!: string;
    public open_posts!: number;
    public phase!: AssignmentPhase;
    public default_poll_description!: string;
    public number_poll_candidates!: boolean;

    public candidate_ids!: Id[]; // (assignment_candidate/assignment_id)[];
    public poll_ids!: Id[]; // (assignment_poll/assignment_id)[];

    public constructor(input?: any) {
        super(Assignment.COLLECTION, input);
    }
}
export interface Assignment
    extends HasMeetingId,
        HasProjectionIds,
        HasAttachmentIds,
        HasTagIds,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasSequentialNumber {}
