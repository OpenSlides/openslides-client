import { Component, Input } from '@angular/core';
import { PollPropertyVerbose } from 'src/app/domain/models/poll';
import { BasePollMetaInformationComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-meta-information.component';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';

import { TopicPollMethodVerbose } from '../../definitions';

@Component({
    selector: `os-topic-poll-meta-info`,
    templateUrl: `./topic-poll-meta-info.component.html`,
    styleUrls: [`./topic-poll-meta-info.component.scss`],
    standalone: false
})
export class TopicPollMetaInfoComponent extends BasePollMetaInformationComponent {
    @Input()
    public showOptions = true;

    public pollPropertyVerbose = PollPropertyVerbose;

    public get hasGlobalOptionEnabled(): boolean {
        return this.poll.hasGlobalOptionEnabled;
    }

    public userCanVote(): boolean {
        return this.poll.canBeVotedFor();
    }

    public getOptionTitle(option: ViewOption): string {
        return option.text;
    }

    public getVerbosePollMethod(): string {
        return TopicPollMethodVerbose[this.poll.pollmethod];
    }
}
