import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent } from '@app/site/base/base.component';
import { LifecycleService } from '@app/site/services/lifecycle.service';

@Component({
    selector: `os-info-actions`,
    templateUrl: `./info-actions.component.html`,
    styleUrls: [`./info-actions.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
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
