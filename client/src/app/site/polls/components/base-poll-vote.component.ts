import { Input } from '@angular/core';

import { VotingError } from 'app/core/ui-services/voting.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { BaseViewPoll } from '../models/base-view-poll';

export abstract class BasePollVoteComponent<V extends BaseViewPoll> extends BaseComponent {
    @Input()
    public poll: V;

    public votingErrors = VotingError;
}
