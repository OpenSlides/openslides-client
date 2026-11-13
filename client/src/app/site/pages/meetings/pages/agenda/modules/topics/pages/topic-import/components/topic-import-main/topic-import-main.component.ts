import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from '@app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getAgendaListSubscriptionConfig } from '../../../../../../agenda.subscription';

@Component({
    selector: `os-topic-import-main`,
    templateUrl: `./topic-import-main.component.html`,
    styleUrls: [`./topic-import-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TopicImportMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAgendaListSubscriptionConfig(id)];
    }
}
