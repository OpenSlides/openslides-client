import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Topic } from 'src/app/domain/models/topics/topic';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import {
    AGENDA_LIST_ITEM_SUBSCRIPTION,
    getAgendaListMinimalSubscriptionConfig,
    getTopicDetailSubscriptionConfig
} from '../../../../../../agenda.subscription';

@Component({
    selector: `os-topic-detail-main`,
    templateUrl: `./topic-detail-main.component.html`,
    styleUrls: [`./topic-detail-main.component.scss`]
})
export class TopicDetailMainComponent extends BaseModelRequestHandlerComponent {
    private _currentTopicId: Id | null = null;

    public constructor(private sequentialNumberMapping: SequentialNumberMappingService) {
        super();
    }

    protected override onShouldCreateModelRequests(params: any, meetingId: any): void {
        if (meetingId) {
            if (+params[`id`]) {
                this.loadTopicDetail(+params[`id`], +params[`meetingId`]);
            } else {
                this.loadTopicList(+params[`meetingId`]);
            }
        }
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (
            params[`id`] !== oldParams[`id`] ||
            (+params[`meetingId`] && params[`meetingId`] !== oldParams[`meetingId`])
        ) {
            if (+params[`id`]) {
                this.loadTopicDetail(+params[`id`], +params[`meetingId`]);
            } else {
                this.loadTopicList(+params[`meetingId`]);
            }
        }
    }

    private loadTopicDetail(sNr: Id, meetingId: Id): void {
        this.sequentialNumberMapping
            .getIdBySequentialNumber({
                collection: Topic.COLLECTION,
                meetingId,
                sequentialNumber: sNr
            })
            .then(id => {
                if (id && this._currentTopicId !== id) {
                    this._currentTopicId = id;
                    this.updateSubscribeTo(getTopicDetailSubscriptionConfig(this._currentTopicId), {
                        hideWhenDestroyed: true
                    });
                }
            });
    }

    private async loadTopicList(meetingId: number): Promise<void> {
        try {
            await this.modelRequestService.waitSubscriptionReady(AGENDA_LIST_ITEM_SUBSCRIPTION, 500);
        } catch (e) {
            await this.updateSubscribeTo(getAgendaListMinimalSubscriptionConfig(meetingId));
        }
    }
}
