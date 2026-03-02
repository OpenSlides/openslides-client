import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { PollApprovalVoteComponent } from '../poll-approval-vote/poll-approval-vote.component';

@Component({
    selector: 'os-poll-vote',
    imports: [PollApprovalVoteComponent, TranslatePipe],
    templateUrl: './poll-vote.component.html',
    styleUrl: './poll-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteComponent {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();

    public configType = computed(() => {
        return collectionFromFqid(this.poll().config_id);
    });

    private operator = inject(OperatorService);

    public isDelegation = computed(() => {
        return this.user().id !== this.operator.user.id;
    });
}
