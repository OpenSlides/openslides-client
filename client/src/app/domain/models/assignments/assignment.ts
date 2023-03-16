import { Id } from '../../definitions/key-types';
import { HasSequentialNumber } from '../../interfaces';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { HasAttachmentIds } from '../../interfaces/has-attachment-ids';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasPollIds } from '../../interfaces/has-poll-ids';
import { HasProjectionIds } from '../../interfaces/has-projectable-ids';
import { HasTagIds } from '../../interfaces/has-tag-ids';
import { BaseModel } from '../base/base-model';
import { AssignmentPhase } from './assignment-phase';

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

    public constructor(input?: any) {
        super(Assignment.COLLECTION, input);
    }

    public static readonly DEFAULT_FIELDSET: (keyof Assignment)[] = [
        `id`,
        `title`,
        `description`,
        `open_posts`,
        `phase`,
        `default_poll_description`,
        `number_poll_candidates`,
        `sequential_number`,
        `candidate_ids`,
        `poll_ids`,
        `agenda_item_id`,
        `list_of_speakers_id`,
        `tag_ids`,
        `attachment_ids`,
        `projection_ids`,
        `meeting_id`
    ];
}
export interface Assignment
    extends HasMeetingId,
        HasProjectionIds,
        HasAttachmentIds,
        HasTagIds,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasSequentialNumber,
        HasPollIds {}
