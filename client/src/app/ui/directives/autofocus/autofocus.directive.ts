import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({
    selector: `[osAutofocus]`,
    standalone: false
})
export class AutofocusDirective implements OnInit {
    private el = inject(ElementRef);

    /**
     * Executed after page init, calls the focus function after an unnoticeable timeout
     */
    public ngOnInit(): void {
        // Otherwise Angular throws error: Expression has changed after it was checked.
        setTimeout(() => {
            this.el.nativeElement.focus();
        });
    }
}
