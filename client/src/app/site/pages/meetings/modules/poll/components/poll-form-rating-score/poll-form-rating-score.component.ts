import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import {
    AbstractControl,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { _, TranslatePipe } from '@ngx-translate/core';
import { RatingScoreOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-rating-score';

import { ViewPoll } from '../../../../pages/polls';

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
export class PollFormRatingScoreComponent {
    public form: UntypedFormGroup;

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

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false],
            max_votes_per_option: [1],
            max_options_amount: [1, [Validators.required, Validators.min(1)]],
            min_options_amount: [
                1,
                [Validators.required, Validators.min(0), this.minOptionsAmountValidator(`max_options_amount`)]
            ],
            max_vote_sum: [1, [Validators.required, Validators.min(1)]],
            min_vote_sum: [1, [Validators.required, Validators.min(0), this.minOptionsAmountValidator(`max_vote_sum`)]]
        });

        effect(this.onOptionAmountUpdate.bind(this));
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
