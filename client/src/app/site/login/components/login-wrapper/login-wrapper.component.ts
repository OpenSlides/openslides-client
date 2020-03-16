import { Component, OnInit } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { LoginDataService } from 'app/core/ui-services/login-data.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Login component.
 *
 * Serves as container for the login mask, reset password (confirm) form, legal notice and privacy policy
 */
@Component({
    selector: 'os-login-wrapper',
    templateUrl: './login-wrapper.component.html',
    styleUrls: ['./login-wrapper.component.scss']
})
export class LoginWrapperComponent extends BaseComponent implements OnInit {
    /**
     * Imports the title service and the translate service
     *
     * @param titleService  to set the title
     * @param translate just needed because super.setTitle depends in the `translator.instant` function
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private loginDataService: LoginDataService
    ) {
        super(componentServiceCollector);
    }

    /**
     * sets the title of the page
     */
    public ngOnInit(): void {
        super.setTitle('Login');
        this.loginDataService.refresh();
    }
}
