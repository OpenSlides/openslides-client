import { computed, Directive, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { BasePollConfigViewModel } from '../../../pages/polls/view-models/base-poll-config-view-model';
import { ViewPollOption } from '../../../pages/polls/view-models/poll-option';

export const PERCENT_DECIMAL_PLACES = 3;

@Directive()
export abstract class PollResultBaseComponent<T extends BasePollConfigViewModel, U> {
    public poll = input.required<ViewPoll>();
    public config = rxResource<T, ViewPoll>({
        params: () => this.poll(),
        stream: ({ params }) => params.config$,
        equal: () => false
    });

    public results = computed<U>(() => {
        if (!this.poll().result || !this.config.hasValue()) {
            return [];
        }

        return this.config.value()?.parsedResult() || {};
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
