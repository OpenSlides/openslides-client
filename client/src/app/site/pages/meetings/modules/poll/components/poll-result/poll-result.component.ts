import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';

import { ViewPoll } from '../../../../pages/polls';
import { PollResultApprovalComponent } from '../poll-result-approval/poll-result-approval.component';

@Component({
    selector: 'os-poll-result',
    imports: [PollResultApprovalComponent],
    templateUrl: './poll-result.component.html',
    styleUrl: './poll-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultComponent {
    public poll = input.required<ViewPoll>();

    public configType = computed(() => {
        if (!this.poll().config_id) {
            return `none`;
        }

        return collectionFromFqid(this.poll().config_id);
    });
}
