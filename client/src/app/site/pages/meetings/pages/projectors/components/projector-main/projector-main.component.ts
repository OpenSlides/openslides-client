import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { SubscriptionConfig } from '@app/domain/interfaces/subscription-config';

import { BaseMeetingModelRequestHandler } from '../../../../base/base-meeting-model-request-handler.component';
import { getProjectorListSubscriptionConfig } from '../../projectors.subscription';

@Component({
    selector: `os-projector-main`,
    templateUrl: `./projector-main.component.html`,
    styleUrls: [`./projector-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ProjectorMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(id: Id): SubscriptionConfig<any>[] {
        return [getProjectorListSubscriptionConfig(id)];
    }
}
