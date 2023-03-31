import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

import { getAgendaListSubscriptionConfig } from '../../../../../../agenda.subscription';

@Component({
    selector: `os-topic-import-main`,
    templateUrl: `./topic-import-main.component.html`,
    styleUrls: [`./topic-import-main.component.scss`]
})
export class TopicImportMainComponent extends BaseModelRequestHandlerComponent {
    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAgendaListSubscriptionConfig(id), { hideWhenMeetingChanged: true });
        }
    }
}
