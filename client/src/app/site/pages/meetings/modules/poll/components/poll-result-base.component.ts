import { Component, computed, input } from '@angular/core';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { ViewPoll, ViewPollOption } from '../../../pages/polls';

export const PERCENT_DECIMAL_PLACES = 3;

@Component({ template: `` })
export abstract class PollResultBaseComponent<T extends BaseViewModel, U> {
    public poll = input.required<ViewPoll>();

    public results = computed<U>(() => {
        if (!this.poll().result) {
            return [];
        }

        return JSON.parse(this.poll().result) || {};
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
