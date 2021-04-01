import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-management',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ManagementComponent extends BaseComponent implements OnInit {
    public constructor(protected componentServiceCollector: ComponentServiceCollector) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {}
}
