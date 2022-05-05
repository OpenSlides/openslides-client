import { ModelRequestValueFor } from 'src/app/infrastructure/annotations/model-request';
import { HasSequentialNumber } from '../../interfaces';
import { HasAgendaItemId } from '../../interfaces/has-agenda-item-id';
import { HasAttachmentIds } from '../../interfaces/has-attachment-ids';
import { HasListOfSpeakersId } from '../../interfaces/has-list-of-speakers-id';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { HasTagIds } from '../../interfaces/has-tag-ids';
import { BaseModel } from '../base/base-model';

const TOPIC_DETAIL_SUBSCRIPTION = `topic_detail`;

/**
 * Representation of a topic.
 * @ignore
 */
export class Topic extends BaseModel<Topic> {
    public static COLLECTION = `topic`;

    // @ModelRequestValueFor([TOPIC_DETAIL_SUBSCRIPTION])
    public readonly title!: string;
    // @ModelRequestValueFor([TOPIC_DETAIL_SUBSCRIPTION])
    public readonly text!: string;

    public constructor(input?: Partial<Topic>) {
        super(Topic.COLLECTION, input);
    }
}
export interface Topic
    extends HasMeetingId,
        HasAgendaItemId,
        HasListOfSpeakersId,
        HasAttachmentIds,
        HasTagIds,
        HasSequentialNumber {}
