import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { HasListOfSpeakers, HasAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { HasTags } from '../../../../motions/modules/tags/view-models/has-tags';
import { HasAttachment } from '../../../../mediafiles/view-models/has-attachment';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';

export class ViewTopic extends BaseProjectableViewModel<Topic> {
    public static COLLECTION = Topic.COLLECTION;

    public get topic(): Topic {
        return this._model;
    }

    // /**
    //  * Formats the category for search
    //  *
    //  * @override
    //  */
    // public formatForSearch(): SearchRepresentation {
    //     return {
    //         properties: [
    //             { key: `Title`, value: this.getTitle() },
    //             { key: `Text`, value: this.text, trusted: true }
    //         ],
    //         searchValue: [this.getTitle(), this.text]
    //     };
    // }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/agenda/topics/${this.sequential_number}`;
    }

    /**
     * Returns the text to be inserted in csv exports
     * @override
     */
    public getCSVExportText(): string {
        return this.text;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.topics;
    }

    public hasAttachments(): boolean {
        return this.attachments && this.attachments.length > 0;
    }
}
export interface ViewTopic extends Topic, HasAttachment, HasTags, HasAgendaItem, HasListOfSpeakers, HasMeeting {}
