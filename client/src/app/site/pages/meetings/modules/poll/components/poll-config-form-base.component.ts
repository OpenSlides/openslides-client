import { Component, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({ template: `` })
export abstract class PollFormBaseComponent {
    public form: UntypedFormGroup;

    protected fb = inject(UntypedFormBuilder);

    public constructor() {
        this.initForm();
    }

    public abstract initForm(): void;
    public abstract getSerialzedForm(): Record<string, unknown>;
}
