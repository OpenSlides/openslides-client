import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: `os-expandable-content-wrapper`,
    templateUrl: `./expandable-content-wrapper.component.html`,
    styleUrls: [`./expandable-content-wrapper.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandableContentWrapperComponent {
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

    /**
     * Function that toggles between showing expanded and collapsed content.
     *
     * @param setTo if true the content will be expanded, if false collapsed, if no value is given the content will always enter the opposite state.
     */
    public toggleExpansion(setTo?: boolean): void {
        if (this.canExpand && !this.disableExpandControl) {
            this.isExpanded = setTo ?? !this.isExpanded;
        }
    }
}
