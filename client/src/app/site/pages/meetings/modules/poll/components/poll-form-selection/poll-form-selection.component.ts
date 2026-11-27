import { Component, computed, input, Signal, signal } from '@angular/core';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PollVisibility } from '@app/domain/models/poll';
import { SelectionOnehundredPercentBase } from '@app/domain/models/poll/poll-config-selection';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { _, TranslatePipe } from '@ngx-translate/core';

import { PollFormBaseComponent } from '../poll-config-form-base.component';

export interface PollFormSelection {
    max_options_amount: number;
    min_options_amount: number;
    allow_nota: boolean;
    onehundred_percent_base: SelectionOnehundredPercentBase;
    strike_out: boolean;
    display_chart: string;
    allow_empty: boolean;
    required_majority: string;
}

@Component({
    selector: 'os-poll-form-selection',
    imports: [FormField, FormRoot, MatCheckboxModule, MatInputModule, MatSelectModule, TranslatePipe, TranslateKeyPipe],
    templateUrl: './poll-form-selection.component.html',
    styleUrls: [`../poll-form/poll-form.component.scss`, './poll-form-selection.component.scss']
})
export class PollFormSelectionComponent extends PollFormBaseComponent<PollFormSelection> {
    public hideMethod = input<boolean>(false);
    public hideDisplayChart = input<boolean>(false);
    public optionAmount = input<number>(null);

    protected readonly model = signal<PollFormSelection>({
        onehundred_percent_base: `valid`,
        strike_out: false,
        allow_nota: false,
        allow_empty: false,
        max_options_amount: 1,
        min_options_amount: 1,
        display_chart: `table`,
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

        required(s.max_options_amount, { message: _('This field is required.') });
        min(s.max_options_amount, 1, { message: _('Amount needs to be at least 1.') });
        max(s.max_options_amount, () => this.optionAmount(), {
            message: _('Amount must not exceed amount of available options.'),
            when: () => !!this.optionAmount()
        });

        required(s.min_options_amount, { message: _('This field is required.') });
        min(s.min_options_amount, 1, { message: _('Amount needs to be at least 1.') });
        validate(s.min_options_amount, ({ value, valueOf }) => {
            const minVal = Number(value());
            const maxVal = Number(valueOf(s.max_options_amount));
            if (Number.isNaN(minVal) || Number.isNaN(maxVal)) {
                return null;
            }
            return minVal <= maxVal
                ? null
                : { kind: 'minGreaterThanMax', message: _('Amount must not exceed amount of max amount of votes.') };
        });
    });

    public validPercentBases: Signal<[SelectionOnehundredPercentBase, string][]> = computed(() => {
        const canUseNoGeneral =
            this.form?.allow_nota().value() ||
            this.form?.allow_empty().value() ||
            this.form?.min_options_amount().value() === 0;
        return [
            ...((canUseNoGeneral ? [[`no_general`, _('Sum of votes without general options.')]] : []) as [
                SelectionOnehundredPercentBase,
                string
            ][]),
            [`valid`, _('All valid ballots')],
            [`cast`, _('All casted ballots')],
            ...((this.formData()?.visibility !== PollVisibility.Manually
                ? [
                      [`entitled`, _('All entitled users')],
                      [`entitled_present`, _('Present entitled users')]
                  ]
                : []) as [SelectionOnehundredPercentBase, string][]),
            [`disabled`, _('Disabled (no percents)')]
        ];
    });


    public getSerialzedForm(): Record<string, unknown> {
        const data: Record<string, unknown> = {
            ...this.model()
        };
        delete data[`allow_empty`];

        return data;
    }

    public override getSerialzedAdditionalData(): Record<string, unknown> {
        return {
            allow_empty: this.model().allow_empty
        };
    }

    protected getPatchedFormData(data: Partial<ViewPoll>): Partial<PollFormSelection> {
        const patch: Record<string, unknown> = {};
        for (const field of [
            `onehundred_percent_base`,
            `strike_out`,
            `allow_nota`,
            `max_options_amount`,
            `min_options_amount`,
            `display_chart`,
            `required_majority`,
            `allow_empty`
        ]) {
            if (data && data[field] !== undefined) patch[field] = data[field];
            else if (data?.config && data.config[field] !== undefined) patch[field] = data.config[field];
        }

        if (patch[`onehundred_percent_base`] === `yes_no`) {
            patch[`onehundred_percent_base`] = `valid`;
        }

        return patch as Partial<PollFormSelection>;
    }
}
