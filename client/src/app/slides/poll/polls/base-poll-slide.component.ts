import { Directive, forwardRef, Inject } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { SlideData } from 'app/core/ui-services/projector.service';
import { ChartData } from 'app/shared/components/charts/charts.component';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { PollService } from 'app/site/polls/services/poll.service';
import { BasePollSlideData } from './base-poll-slide-data';
import { BaseSlideComponent } from '../../base-slide-component';

@Directive()
export abstract class BasePollSlideComponent<
    T extends BasePollSlideData,
    S extends PollService
> extends BaseSlideComponent<T> {
    public chartDataSubject: BehaviorSubject<ChartData> = new BehaviorSubject([]);

    public constructor(
        @Inject(forwardRef(() => PollService))
        public pollService: S
    ) {
        super();
    }

    protected setData(value: SlideData<T>): void {
        super.setData(value);
        this.getDecimalFields().forEach(field => {
            if (value.data.poll[field] !== undefined) {
                value.data.poll[field] = parseFloat(value.data.poll[field]);
            }
        });
        if (value.data.poll.state === PollState.Published) {
            const chartData = this.pollService.generateChartData(value.data.poll);
            this.chartDataSubject.next(chartData);
        }
    }

    protected abstract getDecimalFields(): string[];
}
