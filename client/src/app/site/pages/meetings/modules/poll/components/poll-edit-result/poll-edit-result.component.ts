import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnyPollConfig, Poll } from 'src/app/domain/models/poll';

@Component({
    selector: 'os-poll-edit-result',
    templateUrl: './poll-edit-result.component.html',
    styleUrl: './poll-edit-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollEditResultComponent {
    public pollData = input.required<Partial<Poll>>();
    public pollConfigData = input.required<Partial<AnyPollConfig>>();

    public configType = input.required<string>();
}
