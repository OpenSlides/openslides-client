import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';

@Component({
    selector: `os-icon-container`,
    templateUrl: `./icon-container.component.html`,
    styleUrls: [`./icon-container.component.scss`],
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTooltipModule]
})
export class IconContainerComponent {
    /**
     * HostBinding to add the necessary class related to the size.
     */
    @HostBinding(`class`)
    public get classes(): string {
        return `${this.size}-container ${this.inline ? `inline` : ``}`;
    }

    /**
     * Input for the used icon.
     */
    @Input()
    public icon = ``;

    /**
     * Optional size property. Can be large, if needed.
     */
    @Input()
    public size: 'small' | 'medium' | 'large' | 'gigantic' = `medium`;

    @Input()
    public inline = false;

    /**
     * Whether an icon should be mirrored by 180°.
     */
    @Input()
    public mirrored = false;

    /**
     * Defines a rotation of an icon in the range of 0° up to 359°.
     */
    @Input()
    public rotation = 0;

    /**
     * Reverse text and icon.
     * Show the icon behind the text
     */
    @Input()
    public swap = false;

    /**
     * Hide span completely
     */
    @Input()
    public hide = false;

    /**
     * Boolean to decide, when to show the icon.
     */
    @Input()
    public showIcon = true;

    /**
     * Optional string as tooltip for icon.
     */
    @Input()
    public iconTooltip = ``;

    /**
     * Optional string as tooltip for icon.
     */
    @Input()
    public iconTooltipPosition: TooltipPosition = `below`;

    /**
     * Optional string for tooltip class
     */
    @Input()
    public iconTooltipClass = ``;

    /**
     * Uses a css class for nowrap
     */
    @Input()
    public noWrap = false;

    @Input()
    public color: string | undefined;

    /**
     * Will cause the content not to fill the parent element space.
     * If swap is true this effectively causes the icon to always be right next to the content.
     */
    @Input()
    public noFill = false;

    /**
     * Optional action for clicking on the icon.
     */
    @Output()
    public iconAction: EventEmitter<any> = new EventEmitter();

    /**
     * Function executed, when the icon is clicked.
     */
    public iconClick(): void {
        this.iconAction.emit();
    }

    public getRotation(): string {
        return `rotate(${this.rotation % 360}deg)`;
    }
}
