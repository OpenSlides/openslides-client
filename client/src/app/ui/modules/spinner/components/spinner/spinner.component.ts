import { Component, Input } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

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

    public get height(): string {
        return this._height;
    }

    @Input()
    public set width(value: string | number) {
        if (typeof value === `number`) {
            value = `${value}px`;
        }
        this._width = value;
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

    public constructor() {
        this.text = this.text || _(`Loading data. Please wait ...`);
    }
}
