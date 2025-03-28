import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';

import { BaseMeetingModelRequestHandler } from '../../../../base/base-meeting-model-request-handler.component';
import { getPollListSubscriptionConfig } from '../../polls.subscription';

@Component({
    selector: `os-poll-main`,
    templateUrl: `./poll-main.component.html`,
    styleUrls: [`./poll-main.component.scss`],
    standalone: false
})
export class PollMainComponent extends BaseMeetingModelRequestHandler {
    protected override getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getPollListSubscriptionConfig(id)];
    }
}
