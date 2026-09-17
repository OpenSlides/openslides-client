import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from '@app/site/base/base-model-request-handler.component';
import { getDashboardMeetingListSubscriptionConfig } from '@app/site/pages/organization/pages/dashboard/dashboard.subscription';

@Component({
    selector: `os-account-dialog-main`,
    templateUrl: `./account-dialog-main.component.html`,
    styleUrls: [`./account-dialog-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AccountDialogMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(): void {
        this.subscribeTo(getDashboardMeetingListSubscriptionConfig(), { hideWhenDestroyed: true });
    }
}
