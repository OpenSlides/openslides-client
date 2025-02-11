import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { DirectivesModule } from '../../directives';
import { ExpandableContentWrapperModule } from '../expandable-content-wrapper';

@Component({
    selector: `os-action-card`,
    templateUrl: `./action-card.component.html`,
    styleUrls: [`./action-card.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        DirectivesModule,
        ExpandableContentWrapperModule,
        OpenSlidesTranslationModule
    ]
})
export class ActionCardComponent {
    /**
     * Indicates, whether the action-row should be shown.
     */
    @Input()
    public showActionRow = false;

    /**
     * Indicates, whether the content should be expandable or always expanded.
     *
     * If `true`, it resets the flag `isExpanded`. This prevents an error -
     * when the given element is expanded and the control was disabled, the
     * subscription is deleted.
     */
    @Input()
    public set disableExpandControl(disableControl: boolean) {
        this._disableExpandControl = disableControl;
    }

    /**
     * Returns the flag `disableExpandControl`.
     */
    public get disableExpandControl(): boolean {
        return this._disableExpandControl;
    }

    /**
     * Boolean, whether the control to expand the element should be disabled or not.
     */
    private _disableExpandControl = false;
}
