import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    MAT_LEGACY_CHECKBOX_DEFAULT_OPTIONS as MAT_CHECKBOX_DEFAULT_OPTIONS,
    MatLegacyCheckboxDefaultOptions as MatCheckboxDefaultOptions
} from '@angular/material/legacy-checkbox';

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
    /**
     * Indicated if the checkbox is checked
     */
    @Input() public checked: boolean;
    /**
     * Indicated if the checkbox is disabled
     */
    @Input() public disabled: boolean;
    /**
     * title from the dialog
     */
    @Input() public title: string;
    /**
     * content from the dialog
     */
    @Input() public content: string;
    /**
     * Indicated if the checkbox-event is selected from the user
     */
    @Output() public selected = new EventEmitter<boolean>();

    public constructor(public prompt: PromptService) {}

    public async openPrompt(): Promise<void> {
        if (!this.disabled) {
            if (await this.prompt.open(this.title, this.content)) {
                this.selected.emit(true);
            } else {
                this.selected.emit(false);
            }
        }
    }
}
