import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';

export const PARTICIPANT_DETAIL_SUBSCRIPTION = `user_list`;

@Component({
    selector: `os-participant-detail`,
    templateUrl: `./participant-detail.component.html`,
    styleUrls: [`./participant-detail.component.scss`]
})
export class ParticipantDetailComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`]) {
            this.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewUser,
                    ids: [+params[`id`]],
                    fieldset: DEFAULT_FIELDSET
                },
                subscriptionName: PARTICIPANT_DETAIL_SUBSCRIPTION,
                hideWhenDestroyed: true
            });
        }
    }
}
