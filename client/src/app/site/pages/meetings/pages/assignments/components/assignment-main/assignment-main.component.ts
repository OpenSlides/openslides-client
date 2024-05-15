import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';

import { BaseMeetingModelRequestHandler } from '../../../../base/base-meeting-model-request-handler.component';
import { getAssignmentSubscriptionConfig } from '../../assignments.subscription';

@Component({
    selector: `os-assignment-main`,
    templateUrl: `./assignment-main.component.html`,
    styleUrls: [`./assignment-main.component.scss`]
})
export class AssignmentMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getAssignmentSubscriptionConfig(id)];
    }
}
