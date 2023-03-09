import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAgendaListSubscriptionConfig } from '../../agenda.subscription';

@Component({
    selector: `os-agenda-main`,
    templateUrl: `./agenda-main.component.html`,
    styleUrls: [`./agenda-main.component.scss`]
})
export class AgendaMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAgendaListSubscriptionConfig(id, () => this.hasMeetingIdChangedObservable()));
        }
    }
}
