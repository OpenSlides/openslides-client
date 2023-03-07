import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getProjectorListSubscriptionConfig } from '../../config/model-subscription';

@Component({
    selector: `os-projector-main`,
    templateUrl: `./projector-main.component.html`,
    styleUrls: [`./projector-main.component.scss`]
})
export class ProjectorMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getProjectorListSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
