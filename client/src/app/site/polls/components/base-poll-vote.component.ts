import { Input } from '@angular/core';

import { VotingError } from 'app/core/ui-services/voting.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewBasePoll } from '../models/view-base-poll';

export abstract class BasePollVoteComponent<V extends ViewBasePoll> extends BaseComponent {
    @Input()
    public poll: V;

    public votingErrors = VotingError;
}
