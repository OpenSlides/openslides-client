import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
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
     */
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, Topic, agendaItemRepo);
    }

    public getFieldsets(): Fieldsets<Topic> {
        const titleFields: (keyof Topic)[] = ['title'];
        return {
            [DEFAULT_FIELDSET]: titleFields.concat(['text']),
            list: titleFields,
            title: titleFields
        };
    }

    public getTitle = (topic: ViewTopic) => {
        return topic.title;
    };

    public getListTitle = (topic: ViewTopic) => {
        if (topic.agenda_item && topic.agenda_item.item_number) {
            return `${topic.agenda_item.item_number} · ${topic.title}`;
        } else {
            return this.getTitle(topic);
        }
    };

    public getAgendaListTitle = (topic: ViewTopic) => {
        return { title: this.getListTitle(topic) };
    };

    public getAgendaSlideTitle = (topic: ViewTopic) => {
        return this.getAgendaListTitle(topic).title;
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
