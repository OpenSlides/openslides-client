import { Component, Input, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewBasePoll } from 'app/site/polls/models/view-base-poll';

@Component({
    selector: 'os-poll-progress',
    templateUrl: './poll-progress.component.html',
    styleUrls: ['./poll-progress.component.scss']
})
export class PollProgressComponent extends BaseComponent implements OnInit {
    @Input()
    public poll: ViewBasePoll;

    public max: number;

    public constructor(componentServiceCollector: ComponentServiceCollector, private userRepo: UserRepositoryService) {
        super(componentServiceCollector);
    }

    public get valueInPercent(): number {
        if (this.poll) {
            return (this.poll.votesvalid / this.max) * 100;
        } else {
            return 0;
        }
    }

    /**
     * OnInit.
     * Sets the observable for groups.
     */
    public ngOnInit(): void {
        if (this.poll) {
            this.userRepo
                .getViewModelListObservable()
                .pipe(
                    map(users =>
                        users.filter(user => user.is_present && this.poll.groups_id.intersect(user.groups_id).length)
                    )
                )
                .subscribe(users => {
                    this.max = users.length;
                });
        }
    }
}
