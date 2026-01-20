import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';

import { getMandateCheckSubscriptionConfig } from '../../mandate-check.subscription';

@Component({
    selector: 'os-mandate-check-main',
    imports: [RouterModule],
    templateUrl: './mandate-check-main.component.html',
    styleUrl: './mandate-check-main.component.scss'
})
export class MandateCheckMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getMandateCheckSubscriptionConfig(id)];
    }
}
