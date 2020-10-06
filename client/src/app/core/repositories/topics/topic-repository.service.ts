import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { TopicAction } from 'app/core/actions/topic-action';
import { ActionType } from 'app/core/core-services/action.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Topic } from 'app/shared/models/topics/topic';
import { CreateTopic } from 'app/site/topics/models/create-topic';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { BaseIsAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-is-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

interface T {}

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

    public create(partialTopic: Partial<TopicAction.CreatePayload>): Promise<Identifiable> {
        const payload: TopicAction.CreatePayload = {
            meeting_id: this.activeMeetingService.meetingId,
            title: partialTopic.title,
            text: partialTopic.text,
            tag_ids: partialTopic.tag_ids,
            agenda_parent_id: partialTopic.agenda_parent_id,
            agenda_type: partialTopic.agenda_type,
            agenda_comment: partialTopic.agenda_comment,
            agenda_duration: partialTopic.agenda_duration,
            agenda_weight: partialTopic.agenda_weight,
            attachment_ids: partialTopic.attachment_ids
        };
        return this.sendActionToBackend(ActionType.TOPIC_CREATE, payload);
    }

    public update(update: Partial<Topic>, viewModel: ViewTopic): Promise<void> {
        const payload: TopicAction.UpdatePayload = {
            id: viewModel.id,
            text: update.text,
            title: update.title,
            attachment_ids: update.attachment_ids || [],
            tag_ids: update.tag_ids || []
        };
        return this.sendActionToBackend(ActionType.TOPIC_UPDATE, payload);
    }

    public delete(viewModel: ViewTopic): Promise<void> {
        return this.sendActionToBackend(ActionType.TOPIC_DELETE, { id: viewModel.id });
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
