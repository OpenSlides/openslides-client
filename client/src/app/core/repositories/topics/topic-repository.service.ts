import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { Topic } from 'app/shared/models/topics/topic';
import { CreateTopic } from 'app/site/topics/models/create-topic';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository for topics
 */
@Injectable({
    providedIn: 'root'
})
export class TopicRepositoryService extends BaseIsAgendaItemAndListOfSpeakersContentObjectRepository<ViewTopic, Topic> {
    /**
     * Constructor calls the parent constructor
     *
     * @param DS Access the DataStore
     * @param mapperService OpenSlides mapping service for collections
     * @param dataSend Access the DataSendService
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, Topic, agendaItemRepo);
    }

    public getTitle = (viewTopic: ViewTopic) => {
        return this.agendaItemRepo.getItemNumberPrefix(viewTopic) + viewTopic.title;
    };

    public getAgendaListTitle = (viewTopic: ViewTopic) => {
        // Do not append ' (Topic)' to the title.
        return { title: this.getTitle(viewTopic) };
    };

    public getAgendaSlideTitle = (viewTopic: ViewTopic) => {
        // Do not append ' (Topic)' to the title.
        return this.getTitle(viewTopic);
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Topics' : 'Topic');
    };

    public duplicateTopic(topic: ViewTopic): void {
        this.create(
            new CreateTopic({
                ...topic.topic,
                agenda_type: topic.agenda_item.type,
                agenda_parent_id: topic.agenda_item.parent_id,
                agenda_weight: topic.agenda_item.weight
            })
        );
    }
}
