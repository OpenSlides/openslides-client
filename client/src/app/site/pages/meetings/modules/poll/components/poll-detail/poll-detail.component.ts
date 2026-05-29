import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';

import { PollControllerService } from '../../services/poll-controller.service';
import { VotingService } from '../../services/voting.service';

@Component({
    selector: `os-poll-detail`,
    templateUrl: `./poll-detail.component.html`,
    styleUrls: [`./poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollDetailComponent extends BaseComponent {
    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);

    public constructor() {
        super();
        super.setTitle(`Singular poll`);
    }
}
