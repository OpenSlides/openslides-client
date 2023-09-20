import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component/base-model-request-handler.component';

import { getDesignListSubscriptionConfig } from '../../../../designs.subscription';

@Component({
    selector: `os-design-main`,
    templateUrl: `./design-main.component.html`,
    styleUrls: [`./design-main.component.scss`]
})
export class DesignMainComponent extends BaseModelRequestHandlerComponent {
    protected override onShouldCreateModelRequests(): void {
        this.subscribeTo(getDesignListSubscriptionConfig());
    }
}
