import { Component, ViewEncapsulation } from '@angular/core';
import {
    BasePollFormComponent,
    PollFormHideSelectsData
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-form/base-poll-form.component';

@Component({
    selector: `os-topic-poll-form`,
    templateUrl: `../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.html`,
    styleUrls: [`../../../../../../../../modules/poll/components/base-poll-form/base-poll-form.component.scss`],
    providers: [{ provide: BasePollFormComponent, useExisting: TopicPollFormComponent }],
    encapsulation: ViewEncapsulation.None
})
export class TopicPollFormComponent extends BasePollFormComponent {
    public get hideSelects(): PollFormHideSelectsData {
        return {
            pollMethod: true,
            globalOptions: true,
            hundredPercentBase: true,
            backendDuration: true
        };
    }
}
