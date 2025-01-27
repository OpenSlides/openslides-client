import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

@Component({
    selector: `os-organization-mediafile-main`,
    templateUrl: `./organization-mediafile-main.component.html`,
    styleUrls: [`./organization-mediafile-main.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMediafileMainComponent extends BaseModelRequestHandlerComponent {}
