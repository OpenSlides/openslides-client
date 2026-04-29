import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-motion-poll-form`,
    templateUrl: `./motion-poll-form.component.html`,
    encapsulation: ViewEncapsulation.None
})
export class MotionPollFormComponent extends BaseUiComponent {
    @Input()
    public data: any;
}
