import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CustomIcon } from './definitions';

@Component({
    selector: `os-custom-icon`,
    templateUrl: `./custom-icon.component.html`,
    styleUrls: [`./custom-icon.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class CustomIconComponent {
    @Input()
    public customIcon!: CustomIcon;

    @Input()
    public sizeInPx = 24;

    public get style(): Record<string, any> {
        return {
            height: `${this.sizeInPx}px`,
            width: `${this.sizeInPx}px`
        };
    }
}
