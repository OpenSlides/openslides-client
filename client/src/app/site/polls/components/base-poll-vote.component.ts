import { Input } from '@angular/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { VotingError } from 'app/core/ui-services/voting.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewBasePoll } from '../models/view-base-poll';

export abstract class BasePollVoteComponent<V extends ViewBasePoll> extends BaseComponent {
    @Input()
    public poll: V;

    public votingErrors = VotingError;

    public deliveringVote = false;

    protected user: ViewUser;

    public constructor(componentServiceCollector: ComponentServiceCollector, protected operator: OperatorService) {
        super(componentServiceCollector);

        throw new Error('TODO');
        /*this.subscriptions.push(
            this.operator.getViewUserObservable().subscribe(user => {
                this.user = user;
            })
        );*/
    }
}
