import { computed, Directive, input } from '@angular/core';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { ViewPollOption } from '../../../pages/polls/view-models/poll-option';

export const PERCENT_DECIMAL_PLACES = 3;

@Directive()
export abstract class PollResultBaseComponent<T extends BaseViewModel, U> {
    public poll = input.required<ViewPoll>();

    public results = computed<U>(() => {
        if (!this.poll().result) {
            return [];
        }

        return this.poll()?.config?.parsedResult() || {};
    });

    public config = computed<T | undefined>(() => {
        return this.poll().config;
    });

    /**
     * Contains the poll options sorted by weight
     */
    public options = computed<ViewPollOption[]>(() => {
        return (this.poll().options ?? []).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    });

    protected formatResultDecimal(num: number): string {
        return parseFloat(num.toFixed(PERCENT_DECIMAL_PLACES)).toString();
    }
}
