// External imports
import { Component, Inject, Input, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OVERLAY_COMPONENT_DATA } from 'app/core/ui-services/overlay.service';

/**
 * Component for the global spinner.
 */
@Component({
    selector: `os-spinner`,
    templateUrl: `./spinner.component.html`,
    styleUrls: [`./spinner.component.scss`]
})
export class SpinnerComponent {
    @Input()
    public set height(value: string | number) {
        if (typeof value === `number`) {
            value = `${value}px`;
        }
        this._height = value;
    }

    @Input()
    public set width(value: string | number) {
        if (typeof value === `number`) {
            value = `${value}px`;
        }
        this._width = value;
    }

    public get height(): string {
        return this._height;
    }

    public get width(): string {
        return this._width;
    }

    /**
     * Text, which will be shown if the spinner is shown.
     */
    @Input()
    public text: string;

    @Input()
    public showText = true;

    private _height = `100px`;
    private _width = `100px`;

    /**
     * Constructor
     *
     * @param overlayService Reference to the service for this spinner.
     * @param translate Service to get translations for the messages.
     * @param cd Service to manual initiate a change of the UI.
     */
    public constructor(
        protected translate: TranslateService,
        @Optional() @Inject(OVERLAY_COMPONENT_DATA) data: { text: string }
    ) {
        this.text = data?.text || `Loading data. Please wait ...`;
    }
}
