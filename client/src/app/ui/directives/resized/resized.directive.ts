import { Directive, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { ResizeSensor } from 'css-element-queries';

export interface ElementSize {
    height: number;
    width: number;
}

@Directive({
    selector: '[osResized]'
})
export class ResizedDirective implements OnInit {
    @Output()
    public osResized = new EventEmitter<ElementSize>();

    @Output()
    public osResizedHeight = new EventEmitter<number>();

    /**
     * Old width, to check, if the width has actually changed.
     */
    private oldWidth: number | null = null;

    /**
     * Old height, to check, if the height has actually changed.
     */
    private oldHeight: number | null = null;

    public constructor(private element: ElementRef) {}

    /**
     * Inits the ResizeSensor. triggers initial size change.
     */
    public ngOnInit(): void {
        new ResizeSensor(this.element.nativeElement, () => this.onSizeChanged());
        this.onSizeChanged();
    }

    /**
     * The size has changed. Check, if the size actually has changed. If so,
     * emit the next values.
     */
    private onSizeChanged(): void {
        let hasChanged = false;
        const newWidth = this.element.nativeElement.clientWidth;
        const newHeight = this.element.nativeElement.clientHeight;

        if (newHeight !== this.oldHeight) {
            this.oldHeight = newHeight;
            this.osResizedHeight.emit(newHeight);
            hasChanged = true;
        }
        if (newWidth !== this.oldWidth) {
            this.oldWidth = newWidth;
            hasChanged = true;
        }
        if (hasChanged) {
            this.osResized.emit({ width: newWidth, height: newHeight });
        }
    }
}
