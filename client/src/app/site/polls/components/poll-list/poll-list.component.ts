import { Component } from '@angular/core';

import { PblColumnDefinition } from '@pebula/ngrid';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { VotingService } from 'app/core/ui-services/voting.service';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { PollFilterListService } from '../../services/poll-filter-list.service';

@Component({
    selector: 'os-poll-list',
    templateUrl: './poll-list.component.html',
    styleUrls: ['./poll-list.component.scss']
})
export class PollListComponent extends BaseListViewComponent<ViewPoll> {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'title',
            width: 'auto'
        },
        {
            prop: 'classType',
            width: 'auto'
        },
        {
            prop: 'state',
            width: 'auto'
        },
        {
            prop: 'votability',
            width: '25px'
        }
    ];
    public filterProps = ['title', 'state'];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public pollRepo: PollRepositoryService,
        public filterService: PollFilterListService,
        public votingService: VotingService
    ) {
        super(componentServiceCollector);
        super.setTitle('List of electronic votes');
    }

    /**
     * TODO: Can be removed, when OpenSlides/openslides-autoupdate-service#262 is resolved.
     */
    public canBeVoteFor(poll: ViewPoll): boolean {
        if (poll.state === PollState.Finished || poll.state === PollState.Published) {
            return false;
        }
        return poll.canBeVotedFor() && !poll.operatorHasVoted();
    }
}
