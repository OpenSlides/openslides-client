import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    BaseModelRequestHandlerComponent,
    ModelRequestConfig
} from 'src/app/site/base/base-model-request-handler.component';

import { getOrganizationMediafileListSubscriptionConfig } from '../../mediafiles.subscription';

@Component({
    selector: `os-organization-mediafile-main`,
    templateUrl: `./organization-mediafile-main.component.html`,
    styleUrls: [`./organization-mediafile-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(): void | ModelRequestConfig[] {
        this.subscribeTo(getOrganizationMediafileListSubscriptionConfig(), { hideWhenMeetingChanged: true });
    }
}
