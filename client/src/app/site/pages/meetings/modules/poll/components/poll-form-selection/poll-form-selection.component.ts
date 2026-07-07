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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { _, TranslatePipe } from '@ngx-translate/core';
import { SelectionOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-selection';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-form-selection',
    imports: [ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatSelectModule, TranslatePipe],
    templateUrl: './poll-form-selection.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, './poll-form-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormSelectionComponent {
    public form: UntypedFormGroup;

    public validPercentBases: [SelectionOnehundredPercentBase, string][] = [
        [`no_general`, _('Sum of votes without general options')],
        [`valid`, _('All valid ballots')],
        [`cast`, _('All casted ballots')],
        // [`entitled`, _('All entitled users')],
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    public data = input.required<Partial<ViewPoll>>();
    public optionAmount = input<number>(null);

    private fb = inject(UntypedFormBuilder);

    public constructor() {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            strike_out: [false],
            allow_nota: [false],
            allow_general_abstain: [false],
            max_options_amount: [1, [Validators.required, Validators.min(1)]],
            min_options_amount: [1, [Validators.required, Validators.min(1), this.minOptionsAmountValidator()]],
            display_chart: [``]
        });

        effect(this.onDataUpdated.bind(this));
        effect(this.onOptionAmountUpdate.bind(this));
    }

    public getSerialzedForm(): Record<string, unknown> {
        return {
            ...this.form.value,
            min_options_amount: this.form.value[`allow_general_abstain`] ? 0 : this.form.value[`min_options_amount`]
        };
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

    private onDataUpdated(): void {
        if (!this.data() || !this.form) {
            return;
        }

        const patch: Record<string, any> = {};
        for (const field of [`onehundred_percent_base`, `allow_nota`, `max_options_amount`, `min_options_amount`]) {
            if (this.data().config && this.data().config[field] !== undefined) patch[field] = this.data().config[field];
        }

        this.form.patchValue(patch);
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
