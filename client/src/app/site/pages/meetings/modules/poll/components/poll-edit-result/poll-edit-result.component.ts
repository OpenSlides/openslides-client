import { ChangeDetectionStrategy, Component, computed, input, OnInit, signal } from '@angular/core';
import { applyEach, disabled, form, FormField, schema } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AnyPollConfig, Poll, VOTE_MAJORITY, VOTE_UNDOCUMENTED } from '@app/domain/models/poll';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import { PollConfigRatingApproval } from '@app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from '@app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from '@app/domain/models/poll/poll-config-selection';
import { TranslatePipe } from '@ngx-translate/core';

type PollConfigUnion = PollConfigApproval & PollConfigRatingApproval & PollConfigRatingScore & PollConfigSelection;

interface OptionValue {
    yes: number;
    no: number;
    abstain: number;
}

interface OptionFormEntry {
    value: OptionValue;
    majority: boolean;
}

interface PollEditResultModel {
    options: OptionFormEntry[];
    abstain: number;
    nota: number;
    invalid: number;
    total_ballots: number;
}

@Component({
    selector: 'os-poll-edit-result',
    templateUrl: './poll-edit-result.component.html',
    styleUrl: './poll-edit-result.component.scss',
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormField,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollEditResultComponent implements OnInit {
    public readonly pollData = input.required<Partial<Poll>>();
    public readonly pollConfigData = input.required<Partial<AnyPollConfig>>();
    public readonly options = input.required<{ key: string; title: string }[]>();
    public readonly configType = input.required<string>();

    public readonly pollConfigDataLax = computed(() => this.pollConfigData() as Partial<PollConfigUnion>);

    private readonly model = signal<PollEditResultModel>({
        options: [],
        abstain: 0,
        nota: 0,
        invalid: 0,
        total_ballots: 0
    });

    private optionSchema = schema<OptionFormEntry>(option => {
        disabled(option.value.yes, {
            when: ({ valueOf }) => valueOf(option.majority)
        });
        disabled(option.value.no, {
            when: ({ valueOf }) => valueOf(option.majority)
        });
        disabled(option.value.abstain, {
            when: ({ valueOf }) => valueOf(option.majority)
        });
    });

    public readonly resultForm = form(this.model, s => {
        applyEach(s.options, this.optionSchema);
    });

    public showAbstain = computed(() => {
        const cfg = this.pollConfigDataLax();
        return cfg.min_options_amount === 0 && cfg.min_vote_sum === 0;
    });

    public showNota = computed(() => {
        return !!this.pollConfigDataLax().allow_nota;
    });

    public ngOnInit(): void {
        const result = this.pollData().result ? JSON.parse(this.pollData().result) : {};
        const builtOptions = this.options().map(opt => ({
            value: {
                yes: isNaN(+result[opt.key]) ? null : (result[opt.key] ?? null),
                no: null,
                abstain: null
            },
            majority: result[opt.key] === VOTE_MAJORITY
        }));

        this.model.set({
            options: builtOptions,
            abstain: this.showAbstain() ? (result[`abstain`] ?? null) : null,
            nota: result[`nota`] ?? null,
            invalid: result[`invalid`] ?? null,
            total_ballots: result[`total_ballots`] ?? null
        });
    }

    public updateTotalBallots(): void {
        const data = this.model();
        if (data.options.some(opt => opt.majority)) {
            return;
        }

        if (this.configType() !== 'rating_approval') {
            this.resultForm
                .total_ballots()
                .value.set(
                    data.invalid +
                        data.abstain +
                        data.nota +
                        data.options.reduce((p, c) => p + c.value.yes + c.value.no + c.value.abstain, 0)
                );
        }
    }

    public serializeResult(): Record<string, unknown> {
        const m = this.model();
        const serializedOptions: Record<string, number | string> = {};

        this.options().forEach((option, index) => {
            if (m.options[index]?.majority) {
                serializedOptions[option.key] = VOTE_MAJORITY;
            } else {
                serializedOptions[option.key] = m.options[index]?.value.yes ?? VOTE_UNDOCUMENTED;
            }
        });

        return {
            ...serializedOptions,
            ...(m.invalid !== null ? { invalid: m.invalid } : {}),
            ...(m.total_ballots !== null ? { total_ballots: m.total_ballots } : {}),
            ...(this.showAbstain() ? { abstain: m.abstain } : {}),
            ...(this.showNota() ? { nota: m.nota } : {})
        };
    }
}
