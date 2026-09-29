import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseUiComponent } from '@app/ui/base/base-ui-component';

@Component({
    selector: `os-motion-poll-form`,
    templateUrl: `./motion-poll-form.component.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager
})
export class MotionPollFormComponent extends BaseUiComponent {
    @Input()
    public data: any;
}
