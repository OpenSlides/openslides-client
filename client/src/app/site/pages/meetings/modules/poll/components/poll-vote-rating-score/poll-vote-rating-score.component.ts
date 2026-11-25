import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { applyEach, disabled, form, FormField, FormRoot, max, min, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { _, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ViewPollBallot } from '../../../../pages/polls/view-models/poll-ballot';
import { ViewPollConfigRatingScore } from '../../../../pages/polls/view-models/poll-config-rating-score';
import { PollVoteBaseComponent } from '../poll-vote-base.component';
import { PollVoteButtonComponent } from '../poll-vote-button/poll-vote-button.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-vote-rating-score',
    imports: [
        PollVoteButtonComponent,
        PollVoteOptionComponent,
        NgTemplateOutlet,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslatePipe,
        FormRoot,
        FormField
    ],
    templateUrl: './poll-vote-rating-score.component.html',
    styleUrl: './poll-vote-rating-score.component.scss'
})
export class PollVoteRatingScoreComponent extends PollVoteBaseComponent<ViewPollConfigRatingScore> implements OnInit {
    public voteModel = signal<{
        abstain: boolean;
        options: Record<string, number>;
    }>({
        abstain: false,
        options: {}
    });

    public voteForm = form(this.voteModel, schemaPath => {
        validate(schemaPath.options, ({ value }) => {
            const totalAmount = Object.values(value()).reduce((a, c) => a + c, 0);
            if (totalAmount > this.config().max_vote_sum) {
                return { kind: 'invalid_total_amount', message: _('You exceeded the maximum amount of votes.') };
            } else if (totalAmount < this.config().min_vote_sum) {
                return {
                    kind: 'invalid_total_amount',
                    message: _('You must provide more than the minimum amount of votes.')
                };
            }

            return null;
        });

        validate(schemaPath.options, ({ value }) => {
            const selectedOptions = Object.values(value()).reduce((a, c) => (c > 0 ? a + 1 : a), 0);
            if (this.config().max_options_amount && selectedOptions > this.config().max_options_amount) {
                return { kind: 'invalid_selected_options', message: _('You exceeded the maximum amount of options.') };
            } else if (selectedOptions < this.config().min_options_amount) {
                return {
                    kind: 'invalid_selected_options',
                    message: _('You must select more than the minimum amount of options.')
                };
            }

            return null;
        });

        applyEach(schemaPath.options, option => {
            min(option, 0, {
                message: _('Negative votes not allowed.')
            });
            max(option, () => this.config().max_votes_per_option || undefined, {
                message: _('Too many votes on one option.')
            });

            disabled(option, {
                when: ({ valueOf }) => valueOf(schemaPath.abstain)
            });
        });
    });

    public ballots = signal<ViewPollBallot[]>([]);

    public availableVotes = computed<number>(() => {
        if (this.voteForm.abstain().value()) {
            return 0;
        }

        const totalVotes = Object.values(this.voteForm.options().value()).reduce((a, c) => a + c, 0);
        const maxVotes = this.config()?.max_vote_sum ?? Infinity;
        return maxVotes - totalVotes;
    });

    public availableOptions = computed<number>(() => {
        const maxOptionVotes = this.config()?.max_options_amount ?? Infinity;
        const selectedOptions = Object.values(this.voteForm.options().value()).reduce((a, c) => (c > 0 ? a + 1 : a), 0);
        return maxOptionVotes - selectedOptions;
    });

    private translate = inject(TranslateService);
    private promptService = inject(PromptService);

    public ngOnInit(): void {
        this.voteModel.update(m => {
            m.options = Object.fromEntries(this.options().map(o => [o.id, 0]));
            return m;
        });
    }

    public toggleAbstain(val: boolean): void {
        this.voteForm.abstain().value.set(val);
        if (val) {
            this.submitVote();
        }
    }

    public async submitVote(): Promise<void> {
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);

        const confirmed = await this.promptService.open(title, content);
        if (!confirmed) {
            return;
        }

        if (this.voteForm.abstain().value()) {
            this.voted.emit(null);
            return;
        } else {
            this.voted.emit(Object.fromEntries(Object.entries(this.voteForm.options().value()).filter(e => e[1])));
        }
    }
}
