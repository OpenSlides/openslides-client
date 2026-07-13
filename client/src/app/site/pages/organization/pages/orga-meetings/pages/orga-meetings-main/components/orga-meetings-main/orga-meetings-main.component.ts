import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { getMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/organization.subscription';

@Component({
    selector: `os-orga-meetings-main`,
    templateUrl: `./orga-meetings-main.component.html`,
    styleUrls: [`./orga-meetings-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OrgaMeetingsMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(): void {
        this.subscribeTo(getMeetingListSubscriptionConfig(), { hideWhenMeetingChanged: true });
    }
}
