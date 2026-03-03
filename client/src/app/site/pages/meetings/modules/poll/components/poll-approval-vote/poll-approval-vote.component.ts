import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { _, TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { CustomIconComponent } from 'src/app/ui/modules/custom-icon';
import { CustomIcon } from 'src/app/ui/modules/custom-icon/definitions';

import { ViewBallot, ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-poll-approval-vote',
    templateUrl: './poll-approval-vote.component.html',
    styleUrl: './poll-approval-vote.component.scss',
    imports: [CustomIconComponent, TranslatePipe, MatIconModule, MatButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalVoteComponent implements OnDestroy {
    public readonly drawnCross = CustomIcon.DRAWN_CROSS;

    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();

    public ballots = signal<ViewBallot[]>([]);
    // TODO: use balllots for this user/poll

    private pollRepo = inject(PollRepositoryService);

    public voteActions = computed(() => {
        const actions: any[] = [
            {
                vote: `yes`,
                css: `voted-yes`,
                label: _(`Yes`)
            },
            {
                vote: `no`,
                css: `voted-no`,
                label: _(`No`)
            }
        ];

        if (this.poll().config.allow_abstain) {
            actions.push({
                vote: `abstain`,
                css: `voted-abstain`,
                label: _(`Abstain`)
            });
        }

        return actions;
    });

    public isOptionSelected(_key: string): boolean {
        return false;
    }

    private pollBallotSubscription: Subscription;

    public constructor() {
        effect(() => {
            if (this.pollBallotSubscription) {
                this.pollBallotSubscription.unsubscribe();
            }

            this.pollBallotSubscription = this.pollRepo
                .pollBallotsByUser(this.poll().id, this.user().getMeetingUser().id)
                .subscribe(ballots => {
                    this.ballots.set(ballots);
                });
        });
    }

    public ngOnDestroy(): void {
        if (this.pollBallotSubscription) {
            this.pollBallotSubscription.unsubscribe();
        }
    }
}
