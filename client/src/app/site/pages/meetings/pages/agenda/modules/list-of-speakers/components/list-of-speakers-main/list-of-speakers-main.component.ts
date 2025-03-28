import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import { getListOfSpeakersDetailSubscriptionConfig } from '../../../../agenda.subscription';

@Component({
    selector: `os-list-of-speakers-main`,
    templateUrl: `./list-of-speakers-main.component.html`,
    styleUrls: [`./list-of-speakers-main.component.scss`],
    standalone: false
})
export class ListOfSpeakersMainComponent extends BaseModelRequestHandlerComponent {
    private _currentLOSId: Id | null = null;

    public constructor(private sequentialNumberMapping: SequentialNumberMappingService) {
        super();
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.loadLOSDetail(+params[`id`], +params[`meetingId`]);
        }
    }

    protected override onShouldCreateModelRequests(params: any, meetingId: Id): void {
        if (params[`id`] && meetingId) {
            this.loadLOSDetail(+params[`id`], meetingId);
        }
    }

    private loadLOSDetail(id: Id, meetingId: Id): void {
        this.sequentialNumberMapping
            .getIdBySequentialNumber({
                collection: ListOfSpeakers.COLLECTION,
                meetingId: meetingId,
                sequentialNumber: id
            })
            .then(id => {
                if (id && this._currentLOSId !== id) {
                    this._currentLOSId = id;
                    this.updateSubscribeTo(getListOfSpeakersDetailSubscriptionConfig(this._currentLOSId), {
                        hideWhenDestroyed: true
                    });
                }
            });
    }
}
