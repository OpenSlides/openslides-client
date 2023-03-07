import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAutopilotSubscriptionConfig } from '../../autopilot.subscription';

@Component({
    selector: `os-autopilot-main`,
    templateUrl: `./autopilot-main.component.html`,
    styleUrls: [`./autopilot-main.component.scss`]
})
export class AutopilotMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAutopilotSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
