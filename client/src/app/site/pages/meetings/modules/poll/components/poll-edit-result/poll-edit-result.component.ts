import { ChangeDetectionStrategy, Component, computed, input, OnInit, signal } from '@angular/core';
import { disabled, form, FormField } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { AnyPollConfig, Poll } from 'src/app/domain/models/poll';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';

type PollConfigUnion = PollConfigApproval & PollConfigRatingApproval & PollConfigRatingScore & PollConfigSelection;

interface OptionFormEntry {
    value: number;
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
    imports: [MatCheckboxModule, MatFormFieldModule, MatInputModule, FormField, TranslatePipe],
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

    public readonly resultForm = form(this.model, s => {
        // TODO: this.model().options is empty at this time
        for (let i = 0; i < this.model().options.length; i++) {
            // TODO: Angular 22: Wrap rule into `when`
            disabled(s.options[i].value, ({ valueOf }) => valueOf(s.options[i].majority));
        }
    });

    public ngOnInit(): void {
        this.rebuildModelFromInputs();
    }

    private rebuildModelFromInputs(): void {
        const builtOptions = this.options().map(() => ({
            value: 0,
            majority: false
        }));

        this.model.set({
            options: builtOptions,
            abstain: 0,
            nota: 0,
            invalid: 0,
            total_ballots: 0
        });
    }

    public serializeResult(): Record<string, unknown> {
        const m = this.model();
        const serializedOptions: Record<string, number | string> = {};

        this.options().forEach((option, index) => {
            if (m.options[index]?.majority) {
                serializedOptions[option.key] = `majority`;
            } else {
                serializedOptions[option.key] = m.options[index]?.value ?? 0;
            }
        });

        return {
            ...serializedOptions,
            invalid: m.invalid,
            total_ballots: m.total_ballots,
            ...(this.showAbstain() ? { abstain: m.abstain } : {}),
            ...(this.showNota() ? { nota: m.nota } : {})
        };
    }

    public showAbstain(): boolean {
        const cfg = this.pollConfigDataLax();
        return cfg.min_options_amount === 0 && cfg.min_vote_sum === 0;
    }

    public showNota(): boolean {
        return !!this.pollConfigDataLax().allow_nota;
    }
}
