import { Component, inject } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import {
    AGENDA_LIST_ITEM_SUBSCRIPTION,
    getAgendaListMinimalSubscriptionConfig,
    getAgendaListSubscriptionConfig,
    getTopicDetailSubscriptionConfig
} from '../../../../../../agenda.subscription';

@Component({
    selector: `os-topic-detail-main`,
    templateUrl: `./topic-detail-main.component.html`,
    styleUrls: [`./topic-detail-main.component.scss`]
})
export class TopicDetailMainComponent extends BaseModelRequestHandlerComponent {
    private _currentTopicId: Id | null = null;

    private sequentialNumberMapping = inject(SequentialNumberMappingService);

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.sequentialNumberMapping
                .getIdBySequentialNumber({
                    collection: Topic.COLLECTION,
                    meetingId: params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id && this._currentTopicId !== id) {
                        this._currentTopicId = id;
                        this.loadTopicDetail();
                    } else if (!id && params[`meetingId`]) {
                        this.loadTopicList(+params[`meetingId`]);
                    }
                });
        }
    }

    private loadTopicDetail(): void {
        this.updateSubscribeTo(getTopicDetailSubscriptionConfig(this._currentTopicId), { hideWhenDestroyed: true });
    }

    private async loadTopicList(meetingId: number): Promise<void> {
        const hasMaxSubscription = await this.modelRequestService.subscriptionGotData(AGENDA_LIST_ITEM_SUBSCRIPTION);
        this.updateSubscribeTo(
            hasMaxSubscription
                ? getAgendaListSubscriptionConfig(meetingId)
                : getAgendaListMinimalSubscriptionConfig(meetingId)
        );
    }
}
