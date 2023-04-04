import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { PromptService } from '../../../prompt-dialog';

@Component({
    selector: `os-prompt-checkbox`,
    templateUrl: `./prompt-checkbox.component.html`,
    styleUrls: [`./prompt-checkbox.component.scss`],
    providers: [
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: `noop` } as MatCheckboxDefaultOptions }
    ]
})
export class PromptCheckboxComponent {
    @Input() public checked: boolean;
    @Input() public disabled: boolean;
    @Output() selected = new EventEmitter<boolean>();

    public constructor(public prompt: PromptService) {}

    public async openPrompt(): Promise<void> {
        const title = _(`Change Theme`);
        const content = _(
            `Are you sure you want to activate this design? This will change the design in all committees.`
        );

        if (!this.disabled) {
            if (await this.prompt.open(title, content)) {
                this.selected.emit(true);
            } else {
                this.selected.emit(false);
            }
        }
    }
}
