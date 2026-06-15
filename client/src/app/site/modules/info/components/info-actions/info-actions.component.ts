import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

@Component({
    selector: `os-info-actions`,
    templateUrl: `./info-actions.component.html`,
    styleUrls: [`./info-actions.component.scss`],
    standalone: false
})
export class InfoActionsComponent extends BaseComponent {
    public constructor(private lifecycleService: LifecycleService) {
        super();
    }

    public resetCache(): void {
        this.lifecycleService.reset();
    }
}
