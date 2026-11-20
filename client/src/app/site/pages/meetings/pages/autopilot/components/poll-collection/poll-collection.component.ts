import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Id } from '@app/domain/definitions/key-types';
import { PollContentObject } from '@app/domain/models/poll';
import { BaseComponent } from '@app/site/base/base.component';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { map } from 'rxjs';

import { PollComponent } from '../../../../modules/poll/components/poll/poll.component';
import { getPollDetailSubscriptionConfig, POLL_DETAIL_SUBSCRIPTION } from '../../../polls/polls.subscription';
import { HasPolls, isHavingViewPolls } from '../../../polls/view-models/has-polls';

@Component({
    selector: `os-poll-collection`,
    templateUrl: `./poll-collection.component.html`,
    styleUrls: [`./poll-collection.component.scss`],
    imports: [MatCardModule, NgTemplateOutlet, PollComponent]
})
export class PollCollectionComponent<C extends PollContentObject> extends BaseComponent implements OnDestroy {
    public lastPublishedPoll = signal<ViewPoll | null>(null);

    public currentSubscribed: Id | null = null;

    public readonly disableRunning = input(false);
    public readonly disableFinished = input(false);
    public readonly displayInAutopilot = input(true);
    public currentProjection = input<(Partial<HasPolls<C>> & { readonly fqid: string }) | null>(null);

    public hasProjectedModelOpenPolls = computed(() => {
        if (isHavingViewPolls(this.currentProjection())) {
            const currPolls: ViewPoll[] = this.currentProjection().polls;
            return currPolls.some((p: ViewPoll) => p.isStarted);
        }
        return false;
    });

    private repo = inject(PollControllerService);

    public polls = toSignal(
        this.repo.getViewModelListObservable().pipe(map(polls => polls.filter(poll => poll.canBeVotedFor())))
    );

    public constructor() {
        super();

        effect(this.updateLastPublished.bind(this));
    }

    public override ngOnDestroy(): void {
        if (this.currentSubscribed) {
            this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
        }

        super.ngOnDestroy();
    }

    /**
     * Helper function to detect new latest published polls and set them.
     */
    private updateLastPublished(): void {
        const lastPublished = this.getLastFinishedOrPublishedPoll(this.currentProjection()!);
        if (lastPublished !== this.lastPublishedPoll()) {
            if (
                (this.currentProjection() as BaseViewModel)?.collection === `meeting` &&
                lastPublished &&
                lastPublished.id !== this.currentSubscribed
            ) {
                this.modelRequestService.subscribeTo({
                    ...getPollDetailSubscriptionConfig(lastPublished.id),
                    subscriptionName: `${POLL_DETAIL_SUBSCRIPTION}_${lastPublished.id}`
                });
                if (this.currentSubscribed) {
                    this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
                }
                this.currentSubscribed = lastPublished.id;
            } else if (this.currentSubscribed && lastPublished?.id !== this.currentSubscribed) {
                this.modelRequestService.closeSubscription(`${POLL_DETAIL_SUBSCRIPTION}_${this.currentSubscribed}`);
                this.currentSubscribed = null;
            }

            this.lastPublishedPoll.set(lastPublished);
        }
    }

    private getLastFinishedOrPublishedPoll(viewModel: Partial<HasPolls<C>>): ViewPoll | null {
        if (isHavingViewPolls(viewModel)) {
            let currPolls: ViewPoll[] = viewModel.polls;
            currPolls = currPolls.filter((p: ViewPoll) => p.isFinished).reverse();
            return currPolls.length ? currPolls[0] : null;
        }
        return null;
    }
}
