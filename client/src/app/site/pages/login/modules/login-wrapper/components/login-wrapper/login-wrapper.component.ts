import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';

@Component({
    selector: `os-login-wrapper`,
    templateUrl: `./login-wrapper.component.html`,
    styleUrls: [`./login-wrapper.component.scss`]
})
export class LoginWrapperComponent extends BaseComponent implements OnInit {
    public constructor(componentServiceCollector: ComponentServiceCollectorService, translate: TranslateService) {
        super();
    }

    /**
     * sets the title of the page
     */
    public ngOnInit(): void {
        super.setTitle(`Login`);
    }
}
