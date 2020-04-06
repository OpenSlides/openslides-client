import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { Topic } from 'app/shared/models/topics/topic';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { TitleInformationWithAgendaItem } from 'app/site/base/base-view-model-with-agenda-item';
import { BaseViewModelWithAgendaItemAndListOfSpeakers } from 'app/site/base/base-view-model-with-agenda-item-and-list-of-speakers';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { HasAttachment, ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewTag } from 'app/site/tags/models/view-tag';

export interface TopicTitleInformation extends TitleInformationWithAgendaItem {
    title: string;
    agenda_item_number?: () => string;
}

/**
 * Provides "safe" access to topic with all it's components
 * @ignore
 */
export class ViewTopic extends BaseViewModelWithAgendaItemAndListOfSpeakers<Topic>
    implements TopicTitleInformation, HasAttachment {
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
        return `/topics/${this.id}`;
    }

    /**
     * Returns the text to be inserted in csv exports
     * @override
     */
    public getCSVExportText(): string {
        return this.text;
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                name: Topic.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'topics',
            getDialogTitle: () => this.getTitle()
        };
    }

    public hasAttachments(): boolean {
        return this.attachments && this.attachments.length > 0;
    }
}
interface ITopicRelations {
    attachments: ViewMediafile[];
    agenda_item: ViewAgendaItem[];
    list_of_speakers: ViewListOfSpeakers[];
    tags: ViewTag[];
    meeting: ViewMeeting;
}
export interface ViewTopic extends Topic, ITopicRelations {}
