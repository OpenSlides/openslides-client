import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { SubscriptionConfig } from 'src/app/domain/interfaces/subscription-config';
import { BaseMeetingModelRequestHandler } from 'src/app/site/pages/meetings/base/base-meeting-model-request-handler.component';
import { getDashboardMeetingListSubscriptionConfig } from 'src/app/site/pages/organization/pages/dashboard/dashboard.subscription';

@Component({
    selector: `os-account-dialog-main`,
    templateUrl: `./account-dialog-main.component.html`,
    styleUrls: [`./account-dialog-main.component.scss`],
    standalone: false
})
export class AccountDialogMainComponent extends BaseMeetingModelRequestHandler {
    protected getSubscriptions(_id: Id): SubscriptionConfig<any>[] {
        return [getDashboardMeetingListSubscriptionConfig()];
    }
}
