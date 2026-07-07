import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewPollConfigRatingApproval } from '../../../../pages/polls';
import { PollVoteBaseComponent } from '../poll-vote-base.component';
import { PollVoteButtonComponent } from '../poll-vote-button/poll-vote-button.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-vote-rating-approval',
    imports: [
        PollVoteButtonComponent,
        PollVoteOptionComponent,
        NgTemplateOutlet,
        MatIconModule,
        MatButtonModule,
        TranslatePipe
    ],
    templateUrl: './poll-vote-rating-approval.component.html',
    styleUrl: './poll-vote-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteRatingApprovalComponent extends PollVoteBaseComponent<ViewPollConfigRatingApproval> {
    private translate = inject(TranslateService);
    private promptService = inject(PromptService);

    public selectedOptions = signal<Map<number, string>>(new Map());

    public availableVotes = computed<number>(() => {
        if (this.selectedOptions().has(0)) {
            return 0;
        }

        const maxVotes = this.config()?.max_options_amount ?? 1;
        return maxVotes - this.selectedOptions().size;
    });

    public selectionInvalid = computed<boolean>(() => {
        return this.selectedOptions().size === 0;
    });

    public isSelected(optionId: number, value?: string): boolean {
        return (
            this.selectedOptions().has(optionId) &&
            (value === undefined || this.selectedOptions().get(optionId) === value)
        );
    }

    public toggleOption(optionId: number, value?: string): void {
        const isGeneralOption = optionId < 1;
        const selected = this.selectedOptions();
        if (selected.has(optionId)) {
            selected.delete(optionId);
        } else if (isGeneralOption) {
            selected.clear();
            selected.set(optionId, null);
        } else {
            selected.delete(0);
            if ((this.config()?.max_options_amount ?? 1) === 1) {
                selected.clear();
            } else {
                const maxAmount = this.config()?.max_options_amount ?? 1;
                if (selected.size >= maxAmount) {
                    return;
                }
            }
            selected.set(optionId, value);
        }
        this.selectedOptions.set(new Map(selected));

        if (this.availableVotes() === 0) {
            this.submitVote();
        }
    }

    public async submitVote(): Promise<void> {
        const selected = this.selectedOptions();
        if (selected.size === 0) {
            return;
        }

        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);

        const confirmed = await this.promptService.open(title, content);
        if (!confirmed) {
            return;
        }

        if (selected.has(0)) {
            this.voted.emit({});
        } else {
            this.voted.emit(Object.fromEntries(selected));
        }
    }
}
