import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { SpeakingTimeStructureLevelObject } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { SpeakerRepositoryService } from 'app/core/repositories/agenda/speaker-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { DurationService } from 'app/core/ui-services/duration.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: `os-user-statistics`,
    templateUrl: `./user-statistics.component.html`,
    styleUrls: [`./user-statistics.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class UserStatisticsComponent extends BaseModelContextComponent {
    public finishedSpeakers = this.speakerRepo.finishedSpeakersObservable();
    public pointOfOrders = this.speakerRepo.pointOfOrderSpeakerObservable();
    public uniqueSpeakers = this.speakerRepo.uniqueSpeakersObservable();
    public totalSpeakingTime = this.speakerRepo.totalSpeakingTime();

    /**
     * Returns an observable containing a list. This list contains objects separated by the structure-level of speakers.
     *
     * Those objects hold information about number and duration of requests to speak for a given
     * structure-level.
     */
    public get statisticsByStructureLevelObservable(): Observable<SpeakingTimeStructureLevelObject[]> {
        return this.relationSpeakingTimeStructureLevelSubject.asObservable();
    }

    /**
     * Dedicated, if statistics are opened.
     */
    public get openedStatistics(): boolean {
        return this.statisticIsOpen;
    }

    public readonly columnDefinition: PblColumnDefinition[] = [
        {
            prop: `structureLevel`,
            width: `40%`,
            label: `Structure level`
        },
        {
            prop: `durationOfWordRequests`,
            width: `30%`,
            label: this.translate.instant(`Duration of requests to speak`)
        },
        {
            prop: `numberOfWordRequests`,
            width: `30%`,
            label: this.translate.instant(`Number of requests to speak`)
        }
    ];

    public readonly filterProps: string[] = [`structureLevel`];

    /**
     * List of unique speakers.
     */
    private statisticIsOpen = false;
    private relationSpeakingTimeStructureLevelSubject = new BehaviorSubject<SpeakingTimeStructureLevelObject[]>([]);

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private speakerRepo: SpeakerRepositoryService,
        private durationService: DurationService
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Opens or closes statistics.
     */
    public changeViewOfStatistics(): void {
        this.statisticIsOpen = !this.statisticIsOpen;
        if (this.statisticIsOpen) {
            this.updateSubscription(`speakers`, this.speakerRepo.getViewModelListObservable().subscribe());
        } else {
            this.cleanSubscriptions();
        }
    }

    public getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `speaker_ids`,
                    fieldset: `statistics`
                }
            ],
            fieldset: []
        };
    }

    /**
     * Creates a string from a given `TimeObject`.
     */
    public parseDuration(time: number, withHours: boolean = false): string {
        return !withHours
            ? this.durationService.durationToString(time, `m`)
            : this.durationService.durationToStringWithHours(time);
    }
}
