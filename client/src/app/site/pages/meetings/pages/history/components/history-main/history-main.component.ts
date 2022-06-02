import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMotionListSubscriptionConfig } from '../../../motions/config/model-subscription';

@Component({
    selector: `os-history-main`,
    templateUrl: `./history-main.component.html`,
    styleUrls: [`./history-main.component.scss`]
})
export class HistoryMainComponent extends BaseModelRequestHandlerComponent {
    protected override onParamsChanged(params: any): void {
        if (params[`meetingId`]) {
            this.subscribeTo(
                getMotionListSubscriptionConfig(+params[`meetingId`], () => this.hasMeetingIdChangedObservable())
            );
        }
    }
}
