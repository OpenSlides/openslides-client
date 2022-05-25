import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

@Component({
    selector: `os-account-list-main`,
    templateUrl: `./account-list-main.component.html`,
    styleUrls: [`./account-list-main.component.scss`]
})
export class AccountListMainComponent extends BaseModelRequestHandlerComponent {}
