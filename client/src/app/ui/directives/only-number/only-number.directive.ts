import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
    selector: `[osOnlyNumber]`,
    standalone: false
})
export class OnlyNumberDirective implements OnInit {
    @Input()
    public osOnlyNumber = true;

    /**
     * Whether it is allowed to enter hexadecimal digits (A - F).
     */
    @Input()
    public set osOnlyNumberAllowHex(isAllowed: boolean) {
        this._osOnlyNumberAllowHex = isAllowed;
        this.updateAllowedCharacters();
    }

    /**
     * Whether a number can be leaded by a `0`. For example: `000023`.
     */
    @Input()
    public set osOnlyNumberAllowLeadingZero(isAllowed: boolean) {
        this._osOnlyNumberAllowLeadingZero = isAllowed;
        this.updateAllowedCharacters();
    }

    /**
     * Whether decimal numbers are allowed. These can be introduced with a `,` or `.`.
     * If decimal numbers are allowed, `osOnlyNumberAllowHex` and `osOnlyNumberAllowLeadingZero` will be ignored.
     */
    @Input()
    public set osOnlyNumberAllowDecimal(isAllowed: boolean) {
        this._osOnlyNumberAllowDecimal = isAllowed;
        this.updateAllowedCharacters();
    }

    /**
     * Sets a maximum number of allowed decimal digits. Defaults to `6`.
     * A `0` means, an unlimited number of decimal digits is allowed.
     */
    @Input()
    public set osOnlyNumberMaxDecimalDigits(amount: number) {
        this._osOnlyNumberMaxDecimalDigits = amount;
        this.updateAllowedCharacters();
    }

    private _osOnlyNumberAllowHex = false;
    private _osOnlyNumberAllowLeadingZero = false;
    private _osOnlyNumberAllowDecimal = false;
    private _osOnlyNumberMaxDecimalDigits = 6;

    /**
     * Regex to validate only numbers
     * ^: starts with
     * $: ends
     */
    private regExp!: RegExp;

    private allowedKeys = [`Backspace`, `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Tab`];

    public constructor(private hostElement: ElementRef<HTMLInputElement>) {}

    public ngOnInit(): void {
        this.updateAllowedCharacters();
    }

    @HostListener(`keydown`, [`$event`])
    public onKeyDown(event: KeyboardEvent): void {
        this.regExp.lastIndex = 0;
        const nextValue = this.hostElement.nativeElement.value + event.key;
        if (this.osOnlyNumber) {
            if (
                this.allowedKeys.includes(event.key) ||
                // Allow: Ctrl+A and command+A
                (event.key === `a` && (event.ctrlKey || event.metaKey)) ||
                // Allow: Ctrl+C and command+C
                (event.key === `c` && (event.ctrlKey || event.metaKey)) ||
                // Allow: Ctrl+V and command+V
                (event.key === `v` && (event.ctrlKey || event.metaKey)) ||
                // Allow: Ctrl+X and command+X
                (event.key === `x` && (event.ctrlKey || event.metaKey)) ||
                this.regExp.test(nextValue)
            ) {
                return;
            } else {
                event.preventDefault();
            }
        }
    }

    private updateAllowedCharacters(): void {
        let regexString = ``;
        if (this._osOnlyNumberAllowDecimal) {
            const maximumDecimalDigits =
                this._osOnlyNumberMaxDecimalDigits === 0 ? `` : `{${this._osOnlyNumberMaxDecimalDigits}}`;
            regexString = `^([1-9][0-9]*|0)((,|.)${maximumDecimalDigits})?$`;
        } else {
            const hexCharacters = this._osOnlyNumberAllowHex ? `a-fA-F` : ``;
            const allowedFirstCharacter = `[1-9${hexCharacters}]`;
            const allowedOtherCharacters = `[0-9${hexCharacters}]`;
            regexString = this._osOnlyNumberAllowLeadingZero
                ? `^(${allowedOtherCharacters}*)$`
                : `^(${allowedFirstCharacter}${allowedOtherCharacters}*|0)?$`;
        }
        this.regExp = new RegExp(regexString);
    }
}
