import { Component, computed, effect, input, Signal, signal } from '@angular/core';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PollVisibility } from '@app/domain/models/poll';
import { RatingScoreOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-score';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { _, TranslatePipe } from '@ngx-translate/core';

import { PollFormBaseComponent } from '../poll-config-form-base.component';

export interface PollFormRatingScore {
    max_options_amount: number;
    min_options_amount: number;
    max_votes_per_option: number;
    max_vote_sum: number;
    min_vote_sum: number;
    onehundred_percent_base: RatingScoreOnehundredPercentBase;
    allow_empty: boolean;
    required_majority: string;
}

@Component({
    selector: 'os-poll-form-rating-score',
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
    templateUrl: './poll-form-rating-score.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-score.component.scss`]
})
export class PollFormRatingScoreComponent extends PollFormBaseComponent<PollFormRatingScore> {
    public optionAmount = input<number>(null);

    protected readonly model = signal<PollFormRatingScore>({
        onehundred_percent_base: `valid`,
        allow_empty: false,
        max_votes_per_option: null,
        max_options_amount: 1,
        min_options_amount: 1,
        max_vote_sum: 1,
        min_vote_sum: 1,
        required_majority: `no_majority`
    });

    public readonly form = form(this.model, s => {
        required(s.onehundred_percent_base, { message: _('This field is required.') });
        validate(s.onehundred_percent_base, ({ value }) => {
            if (!this.validPercentBases().some(b => b[0] === value())) {
                return { kind: 'required', message: _('This field is required.') };
            }
            return null;
        });

        required(s.max_vote_sum, { message: _('This field is required.') });
        min(s.max_vote_sum, 1, { message: _('Amount needs to be at least 1') });

        required(s.min_vote_sum, { message: _('This field is required.') });
        min(s.min_vote_sum, 1, { message: _('Amount needs to be at least 1') });
        validate(s.min_vote_sum, ({ value, valueOf }) => {
            const minVal = Number(value());
            const maxVal = Number(valueOf(s.max_vote_sum));
            if (Number.isNaN(minVal) || Number.isNaN(maxVal)) {
                return null;
            }
            return minVal <= maxVal
                ? null
                : { kind: 'minGreaterThanMax', message: _('Amount must not exceed max amount of votes') };
        });

        required(s.max_options_amount, {
            message: _('This field is required.'),
            when: () => !!this.settings().enable_max_options_limit
        });
        min(s.max_options_amount, 1, {
            message: _('Amount needs to be at least 1'),
            when: () => !!this.settings().enable_max_options_limit
        });
        max(s.max_options_amount, () => this.optionAmount(), {
            message: _('Amount must not exceed amount of available options'),
            when: () => !!this.settings().enable_max_options_limit && !!this.optionAmount()
        });

        required(s.min_options_amount, {
            message: _('This field is required.'),
            when: () => !!this.settings().enable_max_options_limit
        });
        min(s.min_options_amount, 1, {
            message: _('Amount needs to be at least 1'),
            when: () => !!this.settings().enable_max_options_limit
        });
        validate(s.min_options_amount, ({ value, valueOf }) => {
            if (!this.settings().enable_max_options_limit) {
                return null;
            }
            const minVal = Number(value());
            const maxVal = Number(valueOf(s.max_options_amount));
            if (Number.isNaN(minVal) || Number.isNaN(maxVal)) {
                return null;
            }
            return minVal <= maxVal
                ? null
                : { kind: 'minGreaterThanMax', message: _('Amount must not exceed max amount of options') };
        });
    });

    public validPercentBases: Signal<[RatingScoreOnehundredPercentBase, string][]> = computed(() => {
        return [
            [`yes_no`, _('Yes/No per candidate')],
            [`valid`, _('All valid ballots')],
            [`cast`, _('All casted ballots')],
            ...((this.formData()?.visibility !== PollVisibility.Manually
                ? [
                      [`entitled`, _('All entitled users')],
                      [`entitled_present`, _('Present entitled users')]
                  ]
                : []) as [RatingScoreOnehundredPercentBase, string][]),
            [`disabled`, _('Disabled (no percents)')]
        ];
    });

    public constructor() {
        super();
        effect(this.onOptionAmountUpdate.bind(this));
    }

    public getSerialzedForm(): Record<string, unknown> {
        const data: Record<string, unknown> = {
            ...this.model()
        };
        delete data[`allow_empty`];

        if (!this.settings().enable_max_options_limit) {
            delete data[`min_options_amount`];
            delete data[`max_options_amount`];
        }

        return data;
    }

    public override getSerialzedAdditionalData(): Record<string, unknown> {
        return {
            allow_empty: this.model().allow_empty
        };
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Partial<PollFormRatingScore> {
        const patch: Record<string, unknown> = {};
        for (const field of [
            `onehundred_percent_base`,
            `max_votes_per_option`,
            `max_options_amount`,
            `min_options_amount`,
            `max_vote_sum`,
            `min_vote_sum`,
            `required_majority`,
            `allow_empty`
        ]) {
            if (data && data[field] !== undefined) patch[field] = data[field];
            else if (data?.config && data.config[field] !== undefined) patch[field] = data.config[field];
        }

        return patch as Partial<PollFormRatingScore>;
    }

    private onOptionAmountUpdate(): void {
        const optionAmount = this.optionAmount();
        if (optionAmount) {
            if (!this.form.max_options_amount().dirty()) {
                this.form.max_options_amount().value.set(optionAmount);
            }
        }
    }
}
