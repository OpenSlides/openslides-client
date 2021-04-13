import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { Topic } from 'app/shared/models/topics/topic';
import { HasAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { HasAttachment } from 'app/site/mediafiles/models/view-mediafile';
import { HasTags } from 'app/site/tags/models/view-tag';

/**
 * Provides "safe" access to topic with all it's components
 * @ignore
 */
export class ViewTopic extends BaseProjectableViewModel<Topic> {
    public static COLLECTION = Topic.COLLECTION;

    public get topic(): Topic {
        return this._model;
    }

    /**
     * Formats the category for search
     *
     * @override
     */
    public formatForSearch(): SearchRepresentation {
        return {
            properties: [
                { key: 'Title', value: this.getTitle() },
                { key: 'Text', value: this.text, trusted: true }
            ],
            searchValue: [this.getTitle(), this.text]
        };
    }

    public getDetailStateURL(): string {
        return `/${this.getActiveMeetingId()}/topics/${this.id}`;
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
