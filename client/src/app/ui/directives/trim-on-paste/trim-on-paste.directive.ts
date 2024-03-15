import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: `[osTrimOnPaste]`
})
export class TrimOnPasteDirective {
    public constructor(private el: ElementRef) {}

    @HostListener(`paste`, [`$event`]) public onPaste(event: ClipboardEvent): void {
        const clipboardData = event.clipboardData;
        let paste = clipboardData?.getData(`text`);
        if (paste !== paste.trim()) {
            event.preventDefault();

            paste = paste.trim();
            if (this.el.nativeElement.value !== paste) {
                this.el.nativeElement.value = paste;
                this.el.nativeElement.dispatchEvent(new Event(`input`));
            } else {
                window.getSelection().removeAllRanges();
            }
        }
    }
}
