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
import { RatingApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-rating-approval';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-rating-approval',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        TranslatePipe
    ],
    templateUrl: './poll-form-rating-approval.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, `./poll-form-rating-approval.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormRatingApprovalComponent {
    public form: UntypedFormGroup;

    public validPercentBases: [RatingApprovalOnehundredPercentBase, string][] = [
        [`yes_no`, _('Yes/No per candidate')],
        [`yes_no_abstain`, _('Yes/No/Abstain per candidate')],
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
            max_yes_amount: [1, [Validators.required, Validators.min(1)]],
            max_options_amount: [1, [Validators.required, Validators.min(1)]],
            min_options_amount: [1, [Validators.required, Validators.min(0), this.minOptionsAmountValidator()]]
        });

        effect(this.onOptionAmountUpdate.bind(this));
    }

    public getSerialzedForm(): Record<string, unknown> {
        return this.form.value;
    }

    private minOptionsAmountValidator(): ValidatorFn {
        return (field: AbstractControl): ValidationErrors | null => {
            const min = Number(field.getRawValue());
            const max = Number(field.parent?.get('max_options_amount')?.getRawValue());

            if (Number.isNaN(min) || Number.isNaN(max)) {
                return null;
            }

            return min <= max ? null : { minGreaterThanMax: true };
        };
    }

    private onOptionAmountUpdate(): void {
        const option_amount = this.optionAmount();
        const maxCtrl = this.form.get('max_options_amount');
        const maxYesCtrl = this.form.get('max_yes_amount');
        if (option_amount) {
            maxCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(option_amount)]);
            maxYesCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(option_amount)]);
            maxCtrl?.setValue(option_amount, { emitEvent: false });
            maxYesCtrl.setValue(option_amount, { emitEvent: false });
        } else {
            maxCtrl?.setValidators([Validators.required, Validators.min(1)]);
            maxYesCtrl?.setValidators([Validators.required, Validators.min(1)]);
        }
        maxCtrl?.updateValueAndValidity({ emitEvent: false });
        maxYesCtrl?.updateValueAndValidity({ emitEvent: false });
    }
}
