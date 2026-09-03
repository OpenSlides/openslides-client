import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RatingApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-approval';
import { RatingScoreOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-score';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { _, TranslatePipe } from '@ngx-translate/core';

import { PollFormBaseComponent } from '../poll-config-form-base.component';

export interface PollFormRatingApproval {
    max_options_amount: number;
    min_options_amount: number;
    max_yes_amount: number;
    onehundred_percent_base: RatingScoreOnehundredPercentBase;
    display_chart: string;
}

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
        [`entitled`, _('All entitled users')],
        // [`entitled_present`, _('Present entitled users')],
        [`disabled`, _('Disabled (no percents)')]
    ];

    public hideMethod = input<boolean>(false);
    public optionAmount = input<number>(null);

    private meetingSettingsService = inject(MeetingSettingsService);

    public maxYesVotesEnabled = this.meetingSettingsService.signal(`poll_enable_max_yes_votes`);

    protected initForm(): void {
        this.form = this.fb.group({
            onehundred_percent_base: [`valid`],
            allow_abstain: [false],
            max_yes_amount: [1, [Validators.required, Validators.min(1)]],
            max_options_amount: [1, [Validators.required, Validators.min(1)]],
            min_options_amount: [1, [Validators.required, Validators.min(0), this.minOptionsAmountValidator()]]
        });

        effect(this.onOptionAmountUpdate.bind(this));

        this.form
            .get(`max_options_amount`)
            .valueChanges.pipe(takeUntilDestroyed())
            .subscribe(() => {
                this.form.get(`min_options_amount`).updateValueAndValidity({ emitEvent: false });
            });
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Record<string, unknown> {
        const patch: Record<string, unknown> = {};
        for (const field of [
            `onehundred_percent_base`,
            `allow_abstain`,
            `max_yes_amount`,
            `max_options_amount`,
            `min_options_amount`
        ]) {
            if (data && data[field] !== undefined) patch[field] = data[field];
            else if (data && data.config[field] !== undefined) patch[field] = data.config[field];
        }

        return patch;
    }

    public getSerialzedForm(): Record<string, unknown> {
        const formValue = this.form.value;
        if (!this.maxYesVotesEnabled()) {
            delete formValue.max_yes_amount;
        }

        return formValue;
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
        const optionAmount = this.optionAmount();
        const maxCtrl = this.form.get('max_options_amount');
        const maxYesCtrl = this.form.get('max_yes_amount');
        if (optionAmount) {
            maxCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(optionAmount)]);
            maxYesCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(optionAmount)]);
            if (maxCtrl?.pristine) {
                maxCtrl?.setValue(optionAmount, { emitEvent: false });
            }

            if (maxYesCtrl?.pristine) {
                maxYesCtrl.setValue(optionAmount, { emitEvent: false });
            }
        } else {
            maxCtrl?.setValidators([Validators.required, Validators.min(1)]);
            maxYesCtrl?.setValidators([Validators.required, Validators.min(1)]);
        }
        maxCtrl?.updateValueAndValidity({ emitEvent: false });
        maxYesCtrl?.updateValueAndValidity({ emitEvent: false });
    }
}
