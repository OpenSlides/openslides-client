import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, OnDestroy } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Id } from '@app/domain/definitions/key-types';
import { PollContentObject } from '@app/domain/models/poll';
import { BaseComponent } from '@app/site/base/base.component';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { map, of, tap } from 'rxjs';

import { getPollDetailSubscriptionConfig, POLL_DETAIL_SUBSCRIPTION } from '../../../polls/polls.subscription';
import { HasPolls, isHavingViewPolls } from '../../../polls/view-models/has-polls';
import { AutopilotPollComponent } from '../autopilot-poll/autopilot-poll.component';

@Component({
    selector: `os-poll-collection`,
    templateUrl: `./poll-collection.component.html`,
    styleUrls: [`./poll-collection.component.scss`],
    imports: [MatCardModule, NgTemplateOutlet, AutopilotPollComponent]
})
export class PollCollectionComponent<C extends PollContentObject> extends BaseComponent implements OnDestroy {
    public currentSubscribed: Id | null = null;

    public readonly disableRunning = input(false);
    public readonly disableFinished = input(false);
    public readonly displayInAutopilot = input(true);
    public currentProjection = input<(Partial<HasPolls<C>> & { readonly fqid: string }) | null>(null);

    public hasProjectedModelOpenPolls = rxResource({
        params: () => ({ projection: this.currentProjection() }),
        defaultValue: false,
        stream: ({ params }) => {
            if (!isHavingViewPolls(params.projection)) {
                return of(false);
            }

            return params.projection.polls$.pipe(map(polls => polls.some((p: ViewPoll) => p.isStarted)));
        }
    });

    private repo = inject(PollControllerService);

    public polls = toSignal(
        this.repo.getViewModelListObservable().pipe(map(polls => polls.filter(poll => poll.canBeVotedFor())))
    );

    public lastPublishedPoll = rxResource({
        params: () => ({ projection: this.currentProjection() }),
        stream: ({ params }) => {
            if (!isHavingViewPolls(params.projection)) {
                return null;
            }

            return params.projection.polls$.pipe(
                map(polls => polls.filter((p: ViewPoll) => p.isFinished).reverse()),
                map(polls => (polls?.length ? polls[0] : null)),
                tap(poll => {
                    if (
                        (params.projection as BaseViewModel)?.collection === `meeting` &&
                        poll &&
                        poll.id !== this.currentSubscribed
                    ) {
                        this.modelRequestService.subscribeTo({
                            ...getPollDetailSubscriptionConfig(poll.id),
                            subscriptionName: `${POLL_DETAIL_SUBSCRIPTION}_${poll.id}`
                        });
                        if (this.currentSubscribed) {
                            this.modelRequestService.closeSubscription(
                                `${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`
                            );
                        }
                        this.currentSubscribed = poll.id;
                    } else if (this.currentSubscribed && poll?.id !== this.currentSubscribed) {
                        this.modelRequestService.closeSubscription(
                            `${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`
                        );
                        this.currentSubscribed = null;
                    }
                })
            );
        }
    });

    public override ngOnDestroy(): void {
        if (this.currentSubscribed) {
            this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
        }

        super.ngOnDestroy();
    }
}
