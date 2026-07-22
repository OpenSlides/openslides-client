import { Component, effect, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { ViewPoll } from '../../../pages/polls';

@Component({ template: `` })
export abstract class PollFormBaseComponent {
    public form: UntypedFormGroup;

    public data = input.required<Partial<ViewPoll>>();

    protected fb = inject(UntypedFormBuilder);

    public constructor() {
        this.initForm();

        effect(this.onDataUpdated.bind(this));
    }

    protected abstract initForm(): void;
    protected abstract getPatchedFormData(data: Partial<ViewPoll>): Record<string, unknown>;
    public abstract getSerialzedForm(): Record<string, unknown>;

    private onDataUpdated(): void {
        if (!this.data() || !this.form) {
            return;
        }

        const patch = this.getPatchedFormData(this.data());
        for (const field of Object.keys(patch)) {
            if (!this.form.get(field)?.pristine) {
                delete patch[field];
            }
        }

        this.form.patchValue(patch);
    }
}
