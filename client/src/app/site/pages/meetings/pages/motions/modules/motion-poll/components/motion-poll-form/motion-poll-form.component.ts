import { Component, ViewEncapsulation } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { PollPropertyVerboseKey } from 'src/app/domain/models/poll';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';

@Component({
    selector: `os-motion-poll-form`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    providers: [{ provide: BasePollFormComponent, useExisting: MotionPollFormComponent }],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class MotionPollFormComponent extends BasePollFormComponent {
    public override PollPropertyVerbose: Record<PollPropertyVerboseKey, string> = {
        ...this.PollPropertyVerbose,
        pollmethod: _(`Voting method`)
    };

    public get hideSelects(): PollFormHideSelectsData {
        return {
            globalOptions: true
        };
    }
}
