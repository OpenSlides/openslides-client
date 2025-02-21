import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { DirectivesModule } from '../../directives';

@Component({
    selector: `os-expandable-content-wrapper`,
    templateUrl: `./expandable-content-wrapper.component.html`,
    styleUrls: [`./expandable-content-wrapper.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, DirectivesModule, OpenSlidesTranslationModule]
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
        this.update();
    }

    /**
     * Returns the flag `disableExpandControl`.
     */
    public get disableExpandControl(): boolean {
        return this._disableExpandControl;
    }

    @Input()
    public set biggerHeight(biggerHeight: boolean) {
        this._biggerHeight = biggerHeight;
    }

    public get biggerHeight(): boolean {
        return this._biggerHeight;
    }

    @Input()
    public set isCollapsed(isCollapsed: boolean) {
        this._isCollapsed = isCollapsed;
    }

    public get isCollapsed(): boolean {
        return this._isCollapsed;
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
    public isExpanded: boolean = false;

    public _isCollapsed: boolean = false;

    public _biggerHeight: boolean = false;

    public constructor(private cd: ChangeDetectorRef) {
        this.isCollapsed = false;
        this.update();
    }

    public onResizedHeight(nextHeight: number): void {
        this.resizesContentBox(nextHeight);
    }

    /**
     * Function that toggles between showing expanded and collapsed content.
     *
     * @param setTo if true the content will be expanded, if false collapsed, if no value is given the content will always enter the opposite state.
     */
    public toggleExpansion(setTo?: boolean): void {
        if (this.canExpand && !this.disableExpandControl) {
            this.isExpanded = setTo ?? !this.isExpanded;
            this.update();
        }
    }

    /**
     * Function to check, if the new height of the element
     * is greater than the limit of `200px`.
     *
     * @param height The new height as `number` of the linked element.
     */
    private resizesContentBox(height: number): void {
        this.canExpand = height > 75;
        this.update();
    }

    private update(): void {
        this.isCollapsed = !this.isExpanded && !this.disableExpandControl && this.canExpand;
        this.cd.markForCheck();
    }
}
