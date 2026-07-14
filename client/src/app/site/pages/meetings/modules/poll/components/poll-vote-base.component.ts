import { Component, computed, input, output } from '@angular/core';
import { BaseViewModel } from '@app/site/base/base-view-model';

import { ViewPoll, ViewPollOption } from '../../../pages/polls';
import { ViewUser } from '../../../view-models/view-user';

@Component({ template: `` })
export abstract class PollVoteBaseComponent<T extends BaseViewModel> {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();

    public config = computed<T | undefined>(() => {
        return this.poll().config;
    });

    public options = computed<ViewPollOption[]>(() => {
        return (this.poll().options ?? []).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    });

    public hasTextOptions = computed<boolean>(() => {
        if (!this.poll().option_ids.length) {
            return false;
        }

        return !!this.options()[0].text;
    });

    public abstract submitVote(value?: unknown): Promise<void>;
}
