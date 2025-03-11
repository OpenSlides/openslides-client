import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: `[osTabNavigation]`,
    exportAs: `isDisabled`
})
export class EditorTabNavigationDirective {
    @Input()
    public buttonList: any;

    @HostListener(`keydown`, [`$event`])
    private navigate(event: KeyboardEvent): void {
        const key = event.key;
        const buttonIndex = this.findButtonIndex();
        let newIndex = buttonIndex;
        const buttons = this.buttonList.toArray();

        switch (key) {
            case `ArrowRight`:
                if (buttonIndex < this.buttonList.length - 1) {
                    newIndex++;
                } else if (buttonIndex === this.buttonList.length - 1) {
                    newIndex = 0;
                }
                while (buttons[newIndex].nativeElement.disabled) {
                    newIndex++;
                }
                break;
            case `ArrowLeft`:
                if (buttonIndex > 0) {
                    newIndex--;
                } else if (buttonIndex === 0) {
                    newIndex = this.buttonList.length - 1;
                }
                while (buttons[newIndex].nativeElement.disabled) {
                    newIndex--;
                }
                break;
            default:
                return;
        }
        this.buttonToFocus = buttons[newIndex];
        this.buttonToFocus.nativeElement.focus();
        this.button.nativeElement.tabIndex = -1;
        this.buttonToFocus.nativeElement.tabIndex = 0;
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
        }
        this.buttonToFocus = buttons[newIndex];
        this.buttonToFocus.nativeElement.focus();
        this.button.nativeElement.tabIndex = -1;
        this.buttonToFocus.nativeElement.tabIndex = 0;
    }

    private buttonToFocus: ElementRef;

    public constructor(private button: ElementRef) {}

    private findButtonIndex(): number {
        return this.buttonList
            .toArray()
            .findIndex((el: ElementRef): boolean => JSON.stringify(el) === JSON.stringify(this.button));
    }
}
