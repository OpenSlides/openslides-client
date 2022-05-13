import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PblColumnDefinition } from '@pebula/ngrid';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DurationService } from 'src/app/site/services/duration.service';
import { TranslateService } from '@ngx-translate/core';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { SpeakingTimeStructureLevelObject } from '../../../../../agenda/modules/list-of-speakers/services/list-of-speakers-controller.service';
import { SpeakerControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services/speaker-controller.service';
import { Identifiable } from 'src/app/domain/interfaces';

interface IdentifiedSpeakingTimeStructureLevelObject extends Identifiable, SpeakingTimeStructureLevelObject {}

@Component({
    selector: 'os-user-statistics',
    templateUrl: './user-statistics.component.html',
    styleUrls: ['./user-statistics.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStatisticsComponent extends BaseComponent {
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
    public get statisticsByStructureLevelObservable(): Observable<IdentifiedSpeakingTimeStructureLevelObject[]> {
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
    private relationSpeakingTimeStructureLevelSubject = new BehaviorSubject<
        IdentifiedSpeakingTimeStructureLevelObject[]
    >([]);

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private speakerRepo: SpeakerControllerService,
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

    /**
     * Creates a string from a given `TimeObject`.
     */
    public parseDuration(time: number | null, withHours: boolean = false): string {
        if (!time) {
            return ``;
        }
        return !withHours
            ? this.durationService.durationToString(time, `m`)
            : this.durationService.durationToStringWithHours(time);
    }
}
