import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Topic } from 'src/app/domain/models/topics/topic';
import { ViewAgendaItem, ViewTopic } from 'src/app/site/pages/meetings/pages/agenda';
import { BackendImportRawPreview } from 'src/app/ui/modules/import-list/definitions/backend-import-preview';

import { Action } from '../../actions';
import { createAgendaItem } from '../agenda';
import { AgendaItemRepositoryService } from '../agenda/agenda-item-repository.service';
import { BaseAgendaItemAndListOfSpeakersContentObjectRepository } from '../base-agenda-item-and-list-of-speakers-content-object-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { TopicAction } from './topic.action';

@Injectable({
    providedIn: `root`
})
export class TopicRepositoryService extends BaseAgendaItemAndListOfSpeakersContentObjectRepository<ViewTopic, Topic> {
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        agendaItemRepo: AgendaItemRepositoryService
    ) {
        super(repositoryServiceCollector, Topic, agendaItemRepo);
    }

    public create(...topics: any[]): Promise<Identifiable[]> {
        const payload: any[] = topics.map(partialTopic => this.getCreatePayload(partialTopic));
        return this.sendBulkActionToBackend(TopicAction.CREATE, payload);
    }

    public update(update: Partial<Topic> & { attachment_mediafile_ids?: Id[] }, viewModel: ViewTopic): Promise<void> {
        const payload: any = {
            id: viewModel.id,
            text: update.text,
            title: update.title,
            attachment_mediafile_ids: update.attachment_mediafile_ids || []
        };
        return this.sendActionToBackend(TopicAction.UPDATE, payload);
    }

    public delete(...viewModels: ViewTopic[]): Promise<void> {
        const payload: Identifiable[] = viewModels.map(topic => ({ id: topic.id }));
        return this.sendBulkActionToBackend(TopicAction.DELETE, payload);
    }

    public jsonUpload(payload: Record<string, any>): Action<BackendImportRawPreview> {
        return this.createAction<BackendImportRawPreview>(TopicAction.JSON_UPLOAD, payload);
    }

    public import(payload: { id: number; import: boolean }[]): Action<BackendImportRawPreview | void> {
        return this.createAction<BackendImportRawPreview | void>(TopicAction.IMPORT, payload);
    }

    public getTitle = (topic: ViewTopic): string => topic.title;

    public override getListTitle = (topic: ViewTopic): string => {
        if (topic.agenda_item && topic.agenda_item.item_number) {
            return `${topic.agenda_item.item_number} · ${topic.title}`;
        } else {
            return this.getTitle(topic);
        }
    };

    public override getAgendaListTitle = (
        topic: ViewTopic
    ): {
        title: string;
    } => ({ title: this.getListTitle(topic) });

    public override getAgendaSlideTitle = (topic: ViewTopic): string => this.getAgendaListTitle(topic).title;

    public getVerboseName = (plural = false): any => this.translate.instant(plural ? `Topics` : `Topic`);

    public duplicateTopics(...topicAgendaItems: ViewAgendaItem<ViewTopic>[]): Promise<Identifiable[]> {
        return this.create(...topicAgendaItems.map(topic => this.getDuplicatedTopic(topic)));
    }

    private getDuplicatedTopic(topicAgendaItem: ViewAgendaItem<ViewTopic>): any {
        const viewTopic = topicAgendaItem.content_object as ViewTopic;
        return {
            ...viewTopic.topic,
            agenda_type: topicAgendaItem.type,
            agenda_parent_id: topicAgendaItem.parent_id,
            agenda_weight: topicAgendaItem.weight,
            agenda_comment: topicAgendaItem.comment,
            agenda_duration: topicAgendaItem.duration,
            tag_ids: topicAgendaItem.tag_ids
        };
    }

    private getCreatePayload(partialTopic: any): any {
        return {
            meeting_id: this.activeMeetingId,
            title: partialTopic.title,
            text: partialTopic.text,
            attachment_mediafile_ids: partialTopic.attachment_mediafile_ids,
            ...createAgendaItem(partialTopic)
        };
    }
}
