import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';

import { ViewPoll } from '../../../../view-models';
import { PollListFilterService } from '../../services/poll-list-filter.service/poll-list-filter.service';

const POLL_LIST_STORAGE_INDEX = `polls`;

@Component({
    selector: `os-poll-list`,
    templateUrl: `./poll-list.component.html`,
    styleUrls: [`./poll-list.component.scss`]
})
export class PollListComponent extends BaseMeetingListViewComponent<ViewPoll> {
    public filterProps = [`title`, `state`];

    public constructor(
        protected override translate: TranslateService,
        public pollRepo: PollControllerService,
        public filterService: PollListFilterService,
        public votingService: VotingService
    ) {
        super();
        super.setTitle(`List of electronic votes`);
        this.listStorageIndex = POLL_LIST_STORAGE_INDEX;
    }

    /**
     * TODO: Can be removed, when OpenSlides/openslides-autoupdate-service#262 is resolved.
     */
    public canBeVoteFor(poll: ViewPoll): boolean {
        if (poll.state === PollState.Finished || poll.state === PollState.Published) {
            return false;
        }
        return poll.canBeVotedFor() && !poll.hasVoted;
    }
}
