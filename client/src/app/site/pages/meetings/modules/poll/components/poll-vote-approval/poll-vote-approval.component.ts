import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { _, TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ViewPollConfigApproval } from '../../../../pages/polls';
import { PollVoteBaseComponent } from '../poll-vote-base.component';
import { PollVoteButtonComponent } from '../poll-vote-button/poll-vote-button.component';

@Component({
    selector: 'os-poll-vote-approval',
    templateUrl: './poll-vote-approval.component.html',
    styleUrl: './poll-vote-approval.component.scss',
    imports: [PollVoteButtonComponent, TranslatePipe, MatIconModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteApprovalComponent extends PollVoteBaseComponent<ViewPollConfigApproval> {
    private translate = inject(TranslateService);
    private promptService = inject(PromptService);

    public selected = signal<string>(null);

    public voteActions = computed(() => {
        const actions: any[] = [
            {
                vote: `yes`,
                label: _(`Yes`)
            },
            {
                vote: `no`,
                label: _(`No`)
            }
        ];

        if (this.poll().config.allow_abstain) {
            actions.push({
                vote: `abstain`,
                label: _(`Abstain`)
            });
        }

        return actions;
    });

    public isOptionSelected(key: string): boolean {
        return this.selected() === key;
    }

    public async submitVote(value: string): Promise<void> {
        this.selected.set(value);
        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);

        const confirmed = await this.promptService.open(title, content);
        if (!confirmed) {
            this.selected.set(null);
            return;
        }

        this.voted.emit(value);
    }
}
