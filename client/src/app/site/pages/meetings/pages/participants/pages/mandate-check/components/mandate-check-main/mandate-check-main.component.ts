import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from '@app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getMandateCheckSubscriptionConfig } from '../../mandate-check.subscription';

@Component({
    selector: 'os-mandate-check-main',
    imports: [RouterModule],
    templateUrl: './mandate-check-main.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './mandate-check-main.component.scss'
})
export class MandateCheckMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getMandateCheckSubscriptionConfig(id)];
    }
}
