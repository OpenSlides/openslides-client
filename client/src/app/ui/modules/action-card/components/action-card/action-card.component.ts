import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: `os-action-card`,
    templateUrl: `./action-card.component.html`,
    styleUrls: [`./action-card.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ActionCardComponent {
    /**
     * Indicates, whether the action-row should be shown.
     */
    @Input()
    public showActionRow: boolean = false;

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
        if (disableControl) {
            this.isExpanded = false;
        }
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

    /**
     * Boolean to see, if the content can be expanded.
     */
    public canExpand = false;

    /**
     * Boolean to see, if the content is currently expanded.
     */
    public isExpanded = false;

    public onResizedHeight(nextHeight: number): void {
        this.resizesContentBox(nextHeight);
    }

    /**
     * Function to check, if the new height of the element
     * is greater than the limit of `200px`.
     *
     * @param height The new height as `number` of the linked element.
     */
    private resizesContentBox(height: number): void {
        this.canExpand = height > 75;
    }
}
