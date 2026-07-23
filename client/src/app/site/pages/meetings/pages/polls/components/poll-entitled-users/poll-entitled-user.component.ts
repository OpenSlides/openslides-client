import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { BaseComponent } from '@app/site/base/base.component';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: `os-poll-entitled-user`,
    templateUrl: `./poll-entitled-user.component.html`,
    styleUrls: [`./poll-entitled-user.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollEntitledUserComponent extends BaseComponent {
    public poll = input.required<ViewPoll>();

    public filterProps = [`user.getFullName`];

    public selectedTab = signal(0);
}
