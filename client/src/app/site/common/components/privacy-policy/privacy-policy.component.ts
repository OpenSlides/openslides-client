import { Component, OnInit } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent extends BaseComponent implements OnInit {
    public constructor(componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.setTitle('Privacy policy');
    }
}
