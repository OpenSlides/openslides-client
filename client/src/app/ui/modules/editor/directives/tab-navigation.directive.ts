import { Directive, ElementRef, HostListener, Input, QueryList } from '@angular/core';

@Directive({
    selector: `[osArrowNavigation]`,
    exportAs: `osArrowNavigation`
})
export class ArrowNavigationDirective {
    @HostListener(`keydown`, [`$event`])
    private navigate(event: KeyboardEvent): void {
        const key = event.key;
        const buttonIndex = this.findButtonIndex();
        let newIndex = buttonIndex;
        const buttons = this.buttonList.toArray();
        // To use "matrix" function give an element the class `2RowStart`
        const amountItemsInRow = buttons.findIndex(el => el.nativeElement.classList.contains(`2RowStart`));
        const hasOnlyOneRow = amountItemsInRow === -1;

        switch (key) {
            // Only hasOnlyOneRow is looping
            // Only hasOnlyOneRow is not using Arrowdown and Arrowup
            // !hasOnlyOneRow stops at end/start of list ("matrix")
            // !hasOnlyOneRow CANNOT deal with disabled cells yet
            case `ArrowRight`:
                if (hasOnlyOneRow) {
                    if (buttonIndex < this.buttonList.length - 1) {
                        newIndex++;
                    } else if (buttonIndex === this.buttonList.length - 1) {
                        newIndex = 0;
                    }
                    while (buttons[newIndex].nativeElement.disabled) {
                        newIndex++;
                        if (buttonIndex === this.buttonList.length - 1) {
                            newIndex = 0;
                        }
                    }
                } else {
                    if (buttonIndex < this.buttonList.length - 1) {
                        newIndex++;
                    }
                }
                break;
            case `ArrowLeft`:
                if (hasOnlyOneRow) {
                    if (buttonIndex > 0) {
                        newIndex--;
                    } else if (buttonIndex === 0) {
                        newIndex = this.buttonList.length - 1;
                    }
                    while (buttons[newIndex].nativeElement.disabled) {
                        newIndex--;
                        if (buttonIndex === 0) {
                            newIndex = this.buttonList.length - 1;
                        }
                    }
                } else {
                    if (buttonIndex > 0) {
                        newIndex--;
                    }
                }
                break;
            case `ArrowDown`:
                if (!hasOnlyOneRow) {
                    event.preventDefault();
                    if (buttonIndex < this.buttonList.length - 1 - amountItemsInRow) {
                        newIndex = newIndex + amountItemsInRow;
                    } else {
                        newIndex = this.buttonList.length - 1;
                    }
                }
                break;
            case `ArrowUp`:
                if (!hasOnlyOneRow) {
                    event.preventDefault();
                    if (buttonIndex > amountItemsInRow) {
                        newIndex = newIndex - amountItemsInRow;
                    } else {
                        newIndex = 0;
                    }
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
    public setDisabled(): void {
        const buttonIndex = this.findButtonIndex();
        let newIndex = buttonIndex;
        const buttons = this.buttonList.toArray();
        if (buttonIndex > 0) {
            newIndex--;
        } else if (buttonIndex === 0) {
            newIndex = this.buttonList.length - 1;
        }
        while (buttons[newIndex].nativeElement.disabled) {
            newIndex--;
            if (buttonIndex === 0) {
                newIndex = this.buttonList.length - 1;
            }
        }
        const buttonToFocus = buttons[newIndex];
        buttonToFocus.nativeElement.focus();
        this.button.nativeElement.tabIndex = -1;
        buttonToFocus.nativeElement.tabIndex = 0;
    }

    @Input()
    public buttonList: QueryList<ElementRef>;

    @Input()
    public setTab(end?: boolean): void {
        let firstButton: undefined | ElementRef;
        this.buttonList.toArray().forEach(button => {
            if (end) {
                firstButton = this.buttonList.toArray()[this.buttonList.length - 1];
            } else if (!firstButton) {
                firstButton = button;
            }
            button.nativeElement.tabIndex = -1;
        });
        firstButton.nativeElement.tabIndex = 0;
    }

    public constructor(private button: ElementRef) {}

    private findButtonIndex(): number {
        return this.buttonList
            .toArray()
            .findIndex((el: ElementRef): boolean => JSON.stringify(el) === JSON.stringify(this.button));
    }
}
