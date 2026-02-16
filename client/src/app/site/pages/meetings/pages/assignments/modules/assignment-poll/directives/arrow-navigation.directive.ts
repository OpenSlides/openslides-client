import { Directive, ElementRef, HostListener, Input, QueryList } from '@angular/core';

@Directive({
    selector: `[osArrowNavigation]`,
    exportAs: `osArrowNavigation`,
    standalone: false
})
export class ResultsArrowNavigationDirective {
    @HostListener(`keydown`, [`$event`])
    private navigate(event: KeyboardEvent): void {
        const key = event.key;
        const buttonIndex = this.findButtonIndex();
        let newIndex = buttonIndex;
        const buttons = this.resultMatrix.toArray();
        const amountItemsInRow = buttons.findIndex(el => el.nativeElement.classList.contains(`2RowStart`));

        switch (key) {
            case `ArrowRight`:
                if (buttonIndex < this.resultMatrix.length - 1) {
                    newIndex++;
                }
                break;
            case `ArrowLeft`:
                if (buttonIndex > 0) {
                    newIndex--;
                }
                break;
            case `ArrowDown`:
                event.preventDefault();
                if (buttonIndex < this.resultMatrix.length - 1 - amountItemsInRow) {
                    newIndex = newIndex + amountItemsInRow;
                } else {
                    newIndex = this.resultMatrix.length - 1;
                }
                break;
            case `ArrowUp`:
                event.preventDefault();
                if (buttonIndex > amountItemsInRow) {
                    newIndex = newIndex - amountItemsInRow;
                } else {
                    newIndex = 0;
                }
                break;
            default:
                return;
        }
        const buttonToFocus = buttons[newIndex];
        buttonToFocus.nativeElement.focus();
        this.button.nativeElement.tabIndex = -1;
        buttonToFocus.nativeElement.tabIndex = 0;
    }

    @Input()
    public resultMatrix: QueryList<ElementRef>;

    public constructor(private button: ElementRef) {}

    private findButtonIndex(): number {
        return this.resultMatrix
            .toArray()
            .findIndex((el: ElementRef): boolean => JSON.stringify(el) === JSON.stringify(this.button));
    }
}
