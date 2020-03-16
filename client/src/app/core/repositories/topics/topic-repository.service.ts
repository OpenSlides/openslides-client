import { Injectable } from '@angular/core';

import { RelationDefinition } from 'app/core/definitions/relations';
import { Topic } from 'app/shared/models/topics/topic';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { CreateTopic } from 'app/site/topics/models/create-topic';
import { TopicTitleInformation, ViewTopic } from 'app/site/topics/models/view-topic';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

const TopicRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'attachments_id',
        ownKey: 'attachments',
        foreignViewModel: ViewMediafile
    }
];

/**
 * Repository for topics
 */
@Injectable({
    providedIn: 'root'
})
export class TopicRepositoryService extends BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<
    ViewTopic,
    Topic,
    TopicTitleInformation
> {
    /**
     * Constructor calls the parent constructor
     *
     * @param DS Access the DataStore
     * @param mapperService OpenSlides mapping service for collections
     * @param dataSend Access the DataSendService
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Topic, TopicRelations);
    }

    public getTitle = (titleInformation: TopicTitleInformation) => {
        if (titleInformation.agenda_item_number && titleInformation.agenda_item_number()) {
            return `${titleInformation.agenda_item_number()} · ${titleInformation.title}`;
        } else {
            return titleInformation.title;
        }
    };

    public getAgendaListTitle = (titleInformation: TopicTitleInformation) => {
        // Do not append ' (Topic)' to the title.
        return { title: this.getTitle(titleInformation) };
    };

    public getAgendaSlideTitle = (titleInformation: TopicTitleInformation) => {
        // Do not append ' (Topic)' to the title.
        return this.getTitle(titleInformation);
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Topics' : 'Topic');
    };

    public duplicateTopic(topic: ViewTopic): void {
        this.create(
            new CreateTopic({
                ...topic.topic,
                agenda_type: topic.item.type,
                agenda_parent_id: topic.item.parent_id,
                agenda_weight: topic.item.weight
            })
        );
    }
}
