import { Component, inject } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import { getListOfSpeakersDetailSubscriptionConfig } from '../../../../agenda.subscription';

@Component({
    selector: `os-list-of-speakers-main`,
    templateUrl: `./list-of-speakers-main.component.html`,
    styleUrls: [`./list-of-speakers-main.component.scss`]
})
export class ListOfSpeakersMainComponent extends BaseModelRequestHandlerComponent {
    private _currentLOSId: Id | null = null;

    private sequentialNumberMapping = inject(SequentialNumberMappingService);

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.sequentialNumberMapping
                .getIdBySequentialNumber({
                    collection: ListOfSpeakers.COLLECTION,
                    meetingId: params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id && this._currentLOSId !== id) {
                        this._currentLOSId = id;
                        this.loadLOSDetail();
                    }
                });
        }
    }

    private loadLOSDetail(): void {
        this.updateSubscribeTo(getListOfSpeakersDetailSubscriptionConfig(this._currentLOSId), {
            hideWhenDestroyed: true
        });
    }
}
