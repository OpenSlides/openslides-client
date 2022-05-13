import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { shuffle } from 'src/app/infrastructure/utils';

const POSSIBLE_MESSAGES = [
    `Loading data. Please wait ...`,
    `An administrator has to be elected`,
    `Motions are being written`,
    `Change recommendations are being assigned`,
    `A submitter has finally submitted their motion`,
    `One topic on the agenda is to eat some cake`
];

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

    private readonly _possibleMessages = shuffle(POSSIBLE_MESSAGES);

    public constructor() {
        this.text = this.text || _(`Loading data. Please wait ...`);
    }
}
