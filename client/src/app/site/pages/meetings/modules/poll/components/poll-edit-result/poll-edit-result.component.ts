import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { AnyPollConfig, Poll } from 'src/app/domain/models/poll';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';

export type PollConfigUnion = PollConfigApproval &
    PollConfigRatingApproval &
    PollConfigRatingScore &
    PollConfigSelection;

@Component({
    selector: 'os-poll-edit-result',
    templateUrl: './poll-edit-result.component.html',
    styleUrl: './poll-edit-result.component.scss',
    imports: [MatCheckboxModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollEditResultComponent {
    public pollData = input.required<Partial<Poll>>();

    public pollConfigData = input.required<Partial<AnyPollConfig>>();
    public pollConfigDataLax = computed(() => this.pollConfigData as Partial<PollConfigUnion>);

    public options = input.required<{ key: string; title: string }[]>();

    public configType = input.required<string>();
}
