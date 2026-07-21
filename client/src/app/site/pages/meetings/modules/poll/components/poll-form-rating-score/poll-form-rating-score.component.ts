import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RatingScoreOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-score';
import { _, TranslatePipe } from '@ngx-translate/core';

import { ViewPoll } from '../../../../pages/polls';
import { PollFormBaseComponent } from '../poll-config-form-base.component';

@Component({
    selector: 'os-poll-form-rating-score',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        TranslatePipe
    ],
    templateUrl: './poll-form-rating-score.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-score.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormRatingScoreComponent extends PollFormBaseComponent {
    public validPercentBases: [RatingScoreOnehundredPercentBase, string][] = [
        [`yes_no`, _('Yes/No per candidate')],
        [`valid`, _('All valid ballots')],
        [`cast`, _('All casted ballots')],
        // [`entitled`, _('All entitled users')],
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    public data = input<Partial<ViewPoll>>();
    public optionAmount = input<number>(null);

    public constructor() {
        super();
        effect(this.onOptionAmountUpdate.bind(this));
    }

    public initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [this.data().config.onehundred_percent_base],
            allow_general_abstain: [false],
            max_votes_per_option: [null],
            max_options_amount: [this.optionAmount(), [Validators.required, Validators.min(1)]],
            min_options_amount: [
                1,
                [Validators.required, Validators.min(1), this.minOptionsAmountValidator(`max_options_amount`)]
            ],
            max_vote_sum: [this.optionAmount(), [Validators.required, Validators.min(1)]],
            min_vote_sum: [1, [Validators.required, Validators.min(1), this.minOptionsAmountValidator(`max_vote_sum`)]]
        });
    }

    public getSerialzedForm(): Record<string, unknown> {
        return {
            ...this.form.value,
            min_options_amount: this.form.value[`allow_general_abstain`] ? 0 : this.form.value[`min_options_amount`],
            min_vote_sum: this.form.value[`allow_general_abstain`] ? 0 : this.form.value[`min_vote_sum`]
        };
    }

    private minOptionsAmountValidator(dependant: string): ValidatorFn {
        return (field: AbstractControl): ValidationErrors | null => {
            const min = Number(field.getRawValue());
            const max = Number(field.parent?.get(dependant)?.getRawValue());

            if (Number.isNaN(min) || Number.isNaN(max)) {
                return null;
            }

            return min <= max ? null : { minGreaterThanMax: true };
        };
    }

    private onOptionAmountUpdate(): void {
        const maxCtrl = this.form.get('max_options_amount');
        if (this.optionAmount()) {
            maxCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(this.optionAmount())]);
        } else {
            maxCtrl?.setValidators([Validators.required, Validators.min(1)]);
        }
        maxCtrl?.updateValueAndValidity({ emitEvent: false });
    }
}
