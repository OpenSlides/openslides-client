import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SelectionOnehundredPercentBase } from '@app/domain/models/poll/poll-config-selection';
import { _, TranslatePipe } from '@ngx-translate/core';

import { ViewPoll } from '../../../../pages/polls';
import { PollFormBaseComponent } from '../poll-config-form-base.component';

@Component({
    selector: 'os-poll-form-selection',
    imports: [ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatSelectModule, TranslatePipe],
    templateUrl: './poll-form-selection.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, './poll-form-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFormSelectionComponent extends PollFormBaseComponent {
    public validPercentBases: [SelectionOnehundredPercentBase, string][] = [
        [`no_general`, _('Sum of votes without general options')],
        [`valid`, _('All valid ballots')],
        [`cast`, _('All casted ballots')],
        // [`entitled`, _('All entitled users')],
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    public optionAmount = input<number>(null);

    public getSerialzedForm(): Record<string, unknown> {
        return {
            ...this.form.value,
            min_options_amount: this.form.value[`allow_general_abstain`] ? 0 : this.form.value[`min_options_amount`]
        };
    }

    protected initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            strike_out: [false],
            allow_nota: [false],
            allow_general_abstain: [false],
            max_options_amount: [1, [Validators.required, Validators.min(1)]],
            min_options_amount: [1, [Validators.required, Validators.min(1), this.minOptionsAmountValidator()]],
            display_chart: [`table`]
        });

        effect(this.onOptionAmountUpdate.bind(this));
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Record<string, unknown> {
        const patch: Record<string, unknown> = {};
        for (const field of [
            `onehundred_percent_base`,
            `strike_out`,
            `allow_nota`,
            `max_options_amount`,
            `min_options_amount`,
            `display_chart`
        ]) {
            if (data && data[field] !== undefined) patch[field] = data[field];
            else if (data && data.config[field] !== undefined) patch[field] = data.config[field];
        }

        if (patch[`onehundred_percent_base`] === `yes_no`) {
            patch[`onehundred_percent_base`] = `valid`;
        }

        if (patch[`min_options_amount`] !== undefined) {
            patch[`allow_general_abstain`] = +patch[`min_options_amount`] === 0;
        }

        return patch;
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
