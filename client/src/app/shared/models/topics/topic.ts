import { Id } from 'app/core/definitions/key-types';
import { BaseModelWithAgendaItemAndListOfSpeakers } from '../base/base-model-with-agenda-item-and-list-of-speakers';

/**
 * Representation of a topic.
 * @ignore
 */
export class Topic extends BaseModelWithAgendaItemAndListOfSpeakers<Topic> {
    public static COLLECTION = 'topic';

    public id: Id;
    public title: string;
    public text: string;

    public attachment_ids: Id[]; // (mediafile/attachement_ids)[];
    public agenda_item_id: Id; // agenda_item/content_object_id;
    public list_of_speakers_id: Id; // list_of_speakers/content_object_id;
    public tag_ids: Id[]; // (tag/tagged_ids)[];
    public meeting_id: Id; // meeting/topic_ids;

    public constructor(input?: Partial<Topic>) {
        super(Topic.COLLECTION, input);
    }
}
