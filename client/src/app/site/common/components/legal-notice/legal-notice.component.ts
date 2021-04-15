import { Component, OnInit } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-legal-notice',
    templateUrl: './legal-notice.component.html'
})
export class LegalNoticeComponent extends BaseComponent implements OnInit {
    public constructor(componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.setTitle('Legal notice');
    }
}
