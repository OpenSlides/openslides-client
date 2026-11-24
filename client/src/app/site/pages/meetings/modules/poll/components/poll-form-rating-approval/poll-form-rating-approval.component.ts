import { Component, computed, effect, input, Signal, signal } from '@angular/core';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PollVisibility } from '@app/domain/models/poll';
import { RatingApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-approval';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { _, TranslatePipe } from '@ngx-translate/core';

import { PollFormBaseComponent } from '../poll-config-form-base.component';

export interface PollFormRatingApproval {
    max_options_amount: number;
    min_options_amount: number;
    max_yes_amount: number;
    onehundred_percent_base: RatingApprovalOnehundredPercentBase;
    allow_abstain: boolean;
    required_majority: string;
}

@Component({
    selector: 'os-poll-form-rating-approval',
    imports: [
        FormField,
        FormRoot,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        TranslatePipe,
        TranslateKeyPipe
    ],
    templateUrl: './poll-form-rating-approval.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-approval.component.scss`]
})
export class PollFormRatingApprovalComponent extends PollFormBaseComponent<PollFormRatingApproval> {
    public hideMethod = input<boolean>(false);
    public optionAmount = input<number>(null);

    protected readonly model = signal<PollFormRatingApproval>({
        onehundred_percent_base: `valid`,
        allow_abstain: false,
        max_options_amount: 1,
        min_options_amount: 1,
        required_majority: `no_majority`,
        max_yes_amount: 1
    });

    public readonly form = form(this.model, s => {
        required(s.onehundred_percent_base, { message: _('This field is required.') });
        validate(s.onehundred_percent_base, ({ value }) => {
            if (!this.validPercentBases().some(b => b[0] === value())) {
                return { kind: 'required', message: _('This field is required.') };
            }
            return null;
        });

        required(s.max_options_amount, { message: _('This field is required.') });
        min(s.max_options_amount, 1, { message: _('Amount needs to be at least 1') });
        max(s.max_options_amount, () => this.optionAmount(), {
            message: _('Amount must not exceed amount of available options'),
            when: () => !!this.optionAmount()
        });

        required(s.min_options_amount, { message: _('This field is required.') });
        min(s.min_options_amount, 0, { message: _('Amount needs to be at least 0') });
        validate(s.min_options_amount, ({ value, valueOf }) => {
            const minVal = Number(value());
            const maxVal = Number(valueOf(s.max_options_amount));
            if (Number.isNaN(minVal) || Number.isNaN(maxVal)) {
                return null;
            }
            return minVal <= maxVal
                ? null
                : { kind: 'minGreaterThanMax', message: _('Amount must not exceed max amount of options') };
        });

        required(s.max_yes_amount, {
            message: _('This field is required.'),
            when: () => !!this.settings().enable_max_yes_votes
        });
        min(s.max_yes_amount, 1, {
            message: _('Amount needs to be at least 1'),
            when: () => !!this.settings().enable_max_yes_votes
        });
        max(s.max_yes_amount, () => this.optionAmount(), {
            message: _('Amount must not exceed amount of available options'),
            when: () => !!this.settings().enable_max_yes_votes && !!this.optionAmount()
        });
    });

    public validPercentBases: Signal<[RatingApprovalOnehundredPercentBase, string][]> = computed(() => {
        return [
            [`yes_no`, _('Yes/No per candidate')],
            ...((this.form?.allow_abstain().value() ? [[`yes_no_abstain`, _('Yes/No/Abstain per candidate')]] : []) as [
                RatingApprovalOnehundredPercentBase,
                string
            ][]),
            [`valid`, _('All valid ballots')],
            [`cast`, _('All casted ballots')],
            ...((this.formData()?.visibility !== PollVisibility.Manually
                ? [
                      [`entitled`, _('All entitled users')],
                      [`entitled_present`, _('Present entitled users')]
                  ]
                : []) as [RatingApprovalOnehundredPercentBase, string][]),
            [`disabled`, _('Disabled (no percents)')]
        ];
    });

    public constructor() {
        super();
        effect(this.onOptionAmountUpdate.bind(this));
    }

    public getSerialzedForm(): Record<string, unknown> {
        const formValue: Record<string, unknown> = { ...this.model() };
        if (!this.settings().enable_max_yes_votes) {
            delete formValue['max_yes_amount'];
        }

        return formValue;
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Partial<PollFormRatingApproval> {
        const patch: Record<string, unknown> = {};
        for (const field of [
            `onehundred_percent_base`,
            `allow_abstain`,
            `max_yes_amount`,
            `max_options_amount`,
            `min_options_amount`,
            `required_majority`
        ]) {
            if (data && data[field] !== undefined) patch[field] = data[field];
            else if (data?.config && data.config[field] !== undefined) patch[field] = data.config[field];
        }

        return patch as Partial<PollFormRatingApproval>;
    }

    private onOptionAmountUpdate(): void {
        const optionAmount = this.optionAmount();
        if (optionAmount) {
            if (!this.form.max_options_amount().dirty()) {
                this.form.max_options_amount().value.set(optionAmount);
            }
            if (!this.form.max_yes_amount().dirty()) {
                this.form.max_yes_amount().value.set(optionAmount);
            }
        }
    }
}
