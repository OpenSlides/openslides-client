import { computed, Directive, effect, input, Signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { PollState } from '@app/domain/models/poll';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { ViewMeetingPollSetting } from '../../../view-models/view-meeting-poll-setting';

@Directive()
export abstract class PollFormBaseComponent<T extends Record<string, any> = Record<string, any>> {
    public abstract readonly form: FieldTree<T>;
    protected abstract readonly model: WritableSignal<T>;
    public abstract readonly validPercentBases: Signal<[string, string][]>;

    public initialData = input.required<Partial<ViewPoll>>();
    public formData = input<Partial<ViewPoll>>();
    public settings = input.required<ViewMeetingPollSetting>();

    public formValid = computed<boolean>(() => this.form().valid());

    public pollStarted = computed<boolean>(() => {
        return this.initialData().state && this.initialData().state !== PollState.Created;
    });

    public constructor() {
        effect(this.onDataUpdated.bind(this));
        effect(() => {
            const bases = this.validPercentBases();
            const form = this.form as unknown as FieldTree<{ onehundred_percent_base: string }>;
            const current = form?.onehundred_percent_base().value();
            if (current && !bases.some(b => b[0] === current)) {
                form.onehundred_percent_base().markAsTouched();
            }
        });
    }

    protected abstract getPatchedFormData(data: Partial<ViewPoll>): Partial<T>;
    public abstract getSerialzedForm(): Record<string, unknown>;

    public getSerialzedAdditionalData(): Record<string, unknown> {
        return {};
    }

    public patchValue(patch: Partial<T>, onlyIfPristine = false): void {
        for (const [key, value] of Object.entries(patch)) {
            if (value !== undefined) {
                const field = (this.form as unknown as FieldTree<any>)[key];
                if (field && (!onlyIfPristine || !field().dirty())) {
                    field().value.set(value);
                }
            }
        }
    }

    private onDataUpdated(): void {
        if (!this.initialData() || !this.form) {
            return;
        }

        const patch = this.getPatchedFormData(this.initialData());
        this.patchValue(patch, true);
    }
}
