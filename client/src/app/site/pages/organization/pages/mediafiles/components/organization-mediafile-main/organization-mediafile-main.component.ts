import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseModelRequestHandlerComponent, ModelRequestConfig } from 'src/app/site/base/base-model-request-handler.component';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { getOrganizationMediafileListSubscriptionConfig } from '../../config/model-subscription';

@Component({
  selector: `os-organization-mediafile-main`,
  templateUrl: `./organization-mediafile-main.component.html`,
  styleUrls: [`./organization-mediafile-main.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileMainComponent extends BaseModelRequestHandlerComponent {

    constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
    ){
        super(modelRequestService, router, openslidesRouter);
    }

    protected override onCreateModelRequests(): void | ModelRequestConfig[] {
        return [getOrganizationMediafileListSubscriptionConfig(() => this.getNextMeetingIdObservable())];
    }
}
