import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getAgendaListSubscriptionConfig } from '../../agenda.subscription';

@Component({
    selector: `os-agenda-main`,
    templateUrl: `./agenda-main.component.html`,
    styleUrls: [`./agenda-main.component.scss`]
})
export class AgendaMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAgendaListSubscriptionConfig(id)];
    }
}
