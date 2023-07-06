import { Component, ElementRef, Input } from '@angular/core';
import { HtmlColor } from 'src/app/domain/definitions/key-types';
import { Color, ColorService } from 'src/app/site/services/color.service';

@Component({
    selector: `os-chip`,
    templateUrl: `./chip.component.html`,
    styleUrls: [`./chip.component.scss`]
})
export class ChipComponent {
    /**
     * An htmlcolor or a css-class can be given as `color`.
     */
    @Input()
    public set color(color: HtmlColor | string) {
        if (/^(#?)[0-9a-fA-F]{6}$/.test(color)) {
            this.cssClass = ``;
            this._color = this.colorService.parseHtmlColorToColor(color);
            this.recalcForegroundColor();
        } else {
            this.cssClass = color;
        }
    }

    public cssClass: string = ``;

    private _color: Color | null = null;
    private _threshold = `0.5`;

    private root = this.hostElement.nativeElement;

    public constructor(private hostElement: ElementRef<HTMLElement>, private colorService: ColorService) {}

    private recalcForegroundColor(): void {
        this.root.style.setProperty(`--os-chip-red`, this._color!.red);
        this.root.style.setProperty(`--os-chip-green`, this._color!.green);
        this.root.style.setProperty(`--os-chip-blue`, this._color!.blue);
        this.root.style.setProperty(`--os-chip-threshold`, this._threshold);
    }
}
