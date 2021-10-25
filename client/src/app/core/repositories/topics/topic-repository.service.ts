import { Injectable } from '@angular/core';

import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { TopicAction } from 'app/core/actions/topic-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Topic } from 'app/shared/models/topics/topic';
import { createAgendaItem } from 'app/shared/utils/create-agenda-item';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
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

    public create(...topics: Partial<TopicAction.CreatePayload>[]): Promise<Identifiable[]> {
        const payload: TopicAction.CreatePayload[] = topics.map(partialTopic => this.getCreatePayload(partialTopic));
        return this.sendBulkActionToBackend(TopicAction.CREATE, payload);
    }

    public update(update: Partial<Topic>, viewModel: ViewTopic): Promise<void> {
        const payload: TopicAction.UpdatePayload = {
            id: viewModel.id,
            text: update.text,
            title: update.title,
            attachment_ids: update.attachment_ids || [],
            tag_ids: update.tag_ids || []
        };
        return this.sendActionToBackend(TopicAction.UPDATE, payload);
    }

    public delete(viewModel: ViewTopic): Promise<void> {
        return this.sendActionToBackend(TopicAction.DELETE, { id: viewModel.id });
    }

    public getFieldsets(): Fieldsets<Topic> {
        const titleFields: (keyof Topic)[] = ['title', 'text'];
        return {
            [DEFAULT_FIELDSET]: titleFields.concat(['text', 'attachment_ids', 'tag_ids']),
            list: titleFields,
            title: titleFields
        };
    }

    public getTitle = (topic: ViewTopic) => topic.title;

    public getListTitle = (topic: ViewTopic) => {
        if (topic.agenda_item && topic.agenda_item.item_number) {
            return `${topic.agenda_item.item_number} · ${topic.title}`;
        } else {
            return this.getTitle(topic);
        }
    };

    public getAgendaListTitle = (topic: ViewTopic) => ({ title: this.getListTitle(topic) });

    public getAgendaSlideTitle = (topic: ViewTopic) => this.getAgendaListTitle(topic).title;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? 'Topics' : 'Topic');

    public duplicateTopics(...topicAgendaItems: ViewAgendaItem[]): Promise<Identifiable[]> {
        return this.create(...topicAgendaItems.map(topic => this.getDuplicatedTopic(topic)));
    }

    private getDuplicatedTopic(topicAgendaItem: ViewAgendaItem): TopicAction.CreatePayload {
        const viewTopic = topicAgendaItem.content_object as ViewTopic;
        return {
            ...viewTopic.topic,
            agenda_type: topicAgendaItem.type,
            agenda_parent_id: topicAgendaItem.parent_id,
            agenda_weight: topicAgendaItem.weight,
            agenda_comment: topicAgendaItem.comment,
            agenda_duration: topicAgendaItem.duration
        };
    }

    private getCreatePayload(partialTopic: Partial<TopicAction.CreatePayload>): TopicAction.CreatePayload {
        return {
            meeting_id: this.activeMeetingIdService.meetingId,
            title: partialTopic.title,
            text: partialTopic.text,
            tag_ids: partialTopic.tag_ids,
            attachment_ids: partialTopic.attachment_ids,
            ...createAgendaItem(partialTopic)
        };
    }
}
