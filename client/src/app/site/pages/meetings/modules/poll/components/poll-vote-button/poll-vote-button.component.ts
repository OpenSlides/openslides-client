import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomIconComponent } from 'src/app/ui/modules/custom-icon';
import { CustomIcon } from 'src/app/ui/modules/custom-icon/definitions';

type OptionType = `yes` | `no` | `abstain`;

@Component({
    selector: 'os-poll-vote-button',
    imports: [MatButtonModule, MatIconModule, CustomIconComponent],
    templateUrl: './poll-vote-button.component.html',
    styleUrl: './poll-vote-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteButtonComponent {
    public readonly drawnCross = CustomIcon.DRAWN_CROSS;

    public isSelected = input.required<boolean>();
    public optionTitle = input.required<string>();

    public optionType = input<OptionType>(`yes`);
    public loading = input<boolean>(false);

    public votedClass = computed<string>(() => {
        return this.isSelected() ? `voted-${this.optionType()}` : ``;
    });

    public toggleOption = output<boolean>();
}
