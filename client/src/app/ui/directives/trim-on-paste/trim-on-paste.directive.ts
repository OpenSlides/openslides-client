import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
    selector: `[osTrimOnPaste]`,
    standalone: false
})
export class TrimOnPasteDirective {
    private el = inject(ElementRef);

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
