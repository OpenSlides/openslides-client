import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getAgendaListSubscriptionConfig } from '../../../../../../agenda.subscription';

@Component({
    selector: `os-topic-import-main`,
    templateUrl: `./topic-import-main.component.html`,
    styleUrls: [`./topic-import-main.component.scss`]
})
export class TopicImportMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAgendaListSubscriptionConfig(id)];
    }
}
