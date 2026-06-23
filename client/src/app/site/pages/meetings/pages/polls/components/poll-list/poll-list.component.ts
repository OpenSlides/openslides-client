import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PollState } from 'src/app/domain/models/poll/poll-constants';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { TranslateKeyPipe } from 'src/app/ui/pipes/translate-key/translate-key.pipe';

import { DetailViewModule } from '../../../../modules/meetings-component-collector/detail-view/detail-view.module';
import { ProjectableListModule } from '../../../../modules/meetings-component-collector/projectable-list/projectable-list.module';
import { ViewPoll } from '../../../../pages/polls';
import { PollListFilterService } from '../../../../pages/polls/services/poll-list-filter.service/poll-list-filter.service';

const POLL_LIST_STORAGE_INDEX = `polls`;

@Component({
    selector: `os-poll-list`,
    templateUrl: `./poll-list.component.html`,
    styleUrls: [`./poll-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        HeadBarModule,
        DetailViewModule,
        ProjectableListModule,
        TranslateKeyPipe,
        TranslatePipe,
        MatIconModule,
        MatTooltipModule
    ]
})
export class PollListComponent extends BaseMeetingListViewComponent<ViewPoll> {
    public filterProps = [`title`, `state`];

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);
    public filterService = inject(PollListFilterService);

    public constructor() {
        super();
        super.setTitle(`List of electronic votes`);
        this.listStorageIndex = POLL_LIST_STORAGE_INDEX;
    }

    /**
     * TODO: Can be removed, when OpenSlides/openslides-autoupdate-service#262 is resolved.
     */
    public canBeVoteFor(poll: ViewPoll): boolean {
        if (poll.state === PollState.Finished) {
            return false;
        }

        return poll.canBeVotedFor();
    }
}
