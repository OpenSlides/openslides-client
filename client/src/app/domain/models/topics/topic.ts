import { HasPollIds } from 'src/app/domain/interfaces/has-poll-ids';

import { HasSequentialNumber } from '../../interfaces';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { HasAttachmentIds } from '../../interfaces/has-attachment-ids';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

/**
 * Representation of a topic.
 * @ignore
 */
export class Topic extends BaseModel<Topic> {
    public static COLLECTION = `topic`;

    public readonly title!: string;
    public readonly text!: string;

    public constructor(input?: Partial<Topic>) {
        super(Topic.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof Topic | { templateField: string })[] = [
        `id`,
        `title`,
        `text`,
        `sequential_number`,
        `attachment_ids`,
        `agenda_item_id`,
        `list_of_speakers_id`,
        `meeting_id`
    ];
}
export interface Topic
    extends HasMeetingId,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasAttachmentIds,
        HasSequentialNumber,
        HasPollIds {}
