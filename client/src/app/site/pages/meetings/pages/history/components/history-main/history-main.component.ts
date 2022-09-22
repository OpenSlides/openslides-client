import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getMotionListSubscriptionConfig } from '../../../motions/config/model-subscription';

@Component({
    selector: `os-history-main`,
    templateUrl: `./history-main.component.html`,
    styleUrls: [`./history-main.component.scss`]
})
export class HistoryMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: Id | null): void {
        if (id) {
            this.subscribeTo(getMotionListSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
