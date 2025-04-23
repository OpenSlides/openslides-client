import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
    selector: `[osAutofocus]`,
    standalone: false
})
export class AutofocusDirective implements OnInit {
    /**
     * Constructor
     *
     * Gets the reference of the annotated element
     * @param el ElementRef
     */
    public constructor(private el: ElementRef) {}

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
