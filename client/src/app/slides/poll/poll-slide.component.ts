import { Component } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { collectionFromFqid } from 'app/core/core-services/key-transforms';
import { SlideData } from 'app/core/ui-services/projector.service';
import { ChartData } from 'app/shared/components/charts/charts.component';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { PollService } from 'app/site/polls/services/poll.service';
import { BaseSlideComponent } from '../base-slide-component';
import { GlobalOption, PollSlideData } from './poll-slide-data';

export enum PollContentObjectType {
    Standalone = 'standalone',
    Motion = 'motion',
    Assignment = 'assignment'
}

@Component({
    selector: 'os-poll-slide',
    templateUrl: './poll-slide.component.html',
    styleUrls: ['./poll-slide.component.scss']
})
export class PollSlideComponent extends BaseSlideComponent<PollSlideData> {
    public PollState = PollState;
    public PollContentObjectType = PollContentObjectType;

    public chartDataSubject: BehaviorSubject<ChartData> = new BehaviorSubject([]);
    public pollContentObjectType: PollContentObjectType = null;

    public constructor(public pollService: PollService) {
        super();
    }

    protected setData(value: SlideData<PollSlideData>): void {
        super.setData(value);

        // Convert every decimal(string) to a float
        ['votesvalid', 'votesinvalid', 'votescast'].forEach((field: keyof PollSlideData) => {
            if (value.data[field] !== undefined) {
                (value.data[field] as any) = parseFloat(value.data[field] as any);
            }
        });
        ['yes', 'no', 'abstain'].forEach((field: keyof GlobalOption) => {
            if (value.data.global_option[field] !== undefined) {
                (value.data.global_option[field] as any) = parseFloat(value.data.global_option[field] as any);
            }
        });
        value.data.options.forEach(option => {
            ['yes', 'no', 'abstain'].forEach((field: keyof GlobalOption) => {
                if (option[field] !== undefined) {
                    (option[field] as any) = parseFloat(option[field] as any);
                }
            });
        });

        if (value.data.state === PollState.Published) {
            const chartData = this.pollService.generateChartData(value.data);
            this.chartDataSubject.next(chartData);
        }

        if (value.data.content_object_id) {
            this.pollContentObjectType = collectionFromFqid(value.data.content_object_id) as PollContentObjectType;
        } else {
            this.pollContentObjectType = PollContentObjectType.Standalone;
        }
    }
}
