import { Injectable } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { Topic } from '@app/domain/models/topics/topic';
import { TopicRepositoryService } from '@app/gateways/repositories/topics/topic-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewAgendaItem } from '@app/site/pages/meetings/pages/agenda';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewTopic } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class TopicControllerService extends BaseMeetingControllerService<ViewTopic, Topic> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: TopicRepositoryService
    ) {
        super(controllerServiceCollector, Topic, repo);
    }

    public create(...topics: Partial<Topic>[]): Promise<Identifiable[]> {
        return this.repo.create(...topics);
    }

    public update(update: Partial<Topic>, topic: ViewTopic): Promise<void> {
        return this.repo.update(update, topic);
    }

    public delete(...topics: ViewTopic[]): Promise<void> {
        return this.repo.delete(...topics);
    }

    public duplicateTopics(...toDuplicate: ViewAgendaItem<ViewTopic>[]): Promise<Identifiable[]> {
        return this.repo.duplicateTopics(...toDuplicate);
    }
}
