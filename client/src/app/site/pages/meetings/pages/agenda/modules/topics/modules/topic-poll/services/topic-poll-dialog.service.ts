import { Injectable } from '@angular/core';
import { BasePollDialogService } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewTopic } from '../../../view-models';

import { TopicPollDialogComponent } from '../components/topic-poll-dialog/topic-poll-dialog.component';
import { TopicPollModule } from '../topic-poll.module';

/**
 * Subclassed to provide the right `PollService` and `DialogComponent`
 */
@Injectable({
    providedIn: TopicPollModule
})
export class TopicPollDialogService extends BasePollDialogService<ViewTopic> {
    protected getComponent(): typeof TopicPollDialogComponent {
        return TopicPollDialogComponent;
    }
}
