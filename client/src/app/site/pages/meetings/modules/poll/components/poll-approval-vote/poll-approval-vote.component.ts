import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { _, TranslatePipe } from '@ngx-translate/core';
import { CustomIconComponent } from 'src/app/ui/modules/custom-icon';
import { CustomIcon } from 'src/app/ui/modules/custom-icon/definitions';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-poll-approval-vote',
    templateUrl: './poll-approval-vote.component.html',
    styleUrl: './poll-approval-vote.component.scss',
    imports: [CustomIconComponent, TranslatePipe, MatIconModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalVoteComponent {
    public readonly drawnCross = CustomIcon.DRAWN_CROSS;

    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();

    public voteActions = computed(() => {
        const actions: any[] = [
            {
                vote: `Y`,
                css: `voted-yes`,
                label: _(`Yes`)
            },
            {
                vote: `N`,
                css: `voted-no`,
                label: _(`No`)
            }
        ];

        if (this.poll().config.allow_abstain) {
            actions.push({
                vote: `A`,
                css: `voted-abstain`,
                label: _(`Abstain`)
            });
        }

        return actions;
    });

    public loading = input<boolean>(false);

    public isOptionSelected(_key: string): boolean {
        return false;
    }

    public saveSingleVote(_key: string): void {}
}
