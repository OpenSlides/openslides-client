import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from '@app/site/base/base-model-request-handler.component/base-model-request-handler.component';

import { getOrganizationTagListSubscriptionConfig } from '../../../../../organization-tags/organization-tags.subscription';
import { getCommitteeListSubscriptionConfig } from '../../../../committees.subscription';

@Component({
    selector: `os-committee-main`,
    templateUrl: `./committee-main.component.html`,
    styleUrls: [`./committee-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommitteeMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(): void {
        this.subscribeTo([getCommitteeListSubscriptionConfig(), getOrganizationTagListSubscriptionConfig()], {
            hideWhenMeetingChanged: true
        });
    }
}
