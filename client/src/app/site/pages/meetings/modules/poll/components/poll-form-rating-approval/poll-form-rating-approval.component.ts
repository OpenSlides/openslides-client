import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { _, TranslatePipe } from '@ngx-translate/core';
import { RatingApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-rating-approval';

import { ViewPoll } from '../../../../pages/polls';
import { PollFormBaseComponent } from '../poll-config-form-base.component';

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
export class PollFormRatingApprovalComponent extends PollFormBaseComponent {
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

    public initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false],
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
        const maxCtrl = this.form.get('max_options_amount');
        if (this.optionAmount()) {
            maxCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(this.optionAmount())]);
        } else {
            maxCtrl?.setValidators([Validators.required, Validators.min(1)]);
        }
        maxCtrl?.updateValueAndValidity({ emitEvent: false });
    }
}
