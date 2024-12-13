import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: `[osTabNavigation]`
})
export class TabNavigationDirective {
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
                }
                while (buttons[newIndex].nativeElement.disabled) {
                    newIndex++;
                }
                break;
            case `ArrowLeft`:
                if (buttonIndex > 0) {
                    newIndex--;
                }
                while (buttons[newIndex].nativeElement.disabled) {
                    newIndex--;
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

    public constructor(private button: ElementRef) {}

    private findButtonIndex(): number {
        return this.buttonList
            .toArray()
            .findIndex((el: ElementRef): boolean => JSON.stringify(el) === JSON.stringify(this.button));
    }
}
