import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { StructureLevelListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/structure-level-list-of-speakers';
import { DurationService } from 'src/app/site/services/duration.service';

@Component({
    selector: `os-speaking-times`,
    templateUrl: `./speaking-times.component.html`,
    styleUrls: [`./speaking-times.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeakingTimesComponent implements OnDestroy {
    private subscribedIds: Set<Id> = new Set();
    private subscriptions: Map<Id, Subscription> = new Map();
    private structureLevels: Map<Id, any> = new Map();

    @Input()
    public set currentSpeakingTimes(speakingTimes: Id[]) {
        const newSpeakingTimes = new Set(speakingTimes);

        for (const speakingTimeId of this.subscribedIds.difference(newSpeakingTimes)) {
            this.subscribedIds.delete(speakingTimeId);
            this.subscriptions.get(speakingTimeId).unsubscribe();
            this.subscriptions.delete(speakingTimeId);
            this.structureLevels.delete(speakingTimeId);
        }

        for (const speakingTimeId of newSpeakingTimes.difference(this.subscribedIds)) {
            this.subscribedIds.add(speakingTimeId);
            this.subscriptions.set(
                speakingTimeId,
                this.speakingTimesRepo.getViewModelObservable(speakingTimeId).subscribe(speakingTime => {
                    console.log(speakingTime.structure_level.color, speakingTime, speakingTime.structure_level);
                    const remaining = speakingTime.remaining_time + (speakingTime.additional_time || 0);
                    this.structureLevels.set(speakingTimeId, {
                        name: speakingTime.structure_level.getTitle(),
                        color: speakingTime.structure_level.color,
                        countdown: {
                            running: !!speakingTime.current_start_time,
                            countdown_time: speakingTime.current_start_time
                                ? speakingTime.current_start_time + remaining
                                : remaining
                        }
                    });
                    this.cd.markForCheck();
                })
            );
        }
    }

    constructor(
        private durationService: DurationService,
        private speakingTimesRepo: StructureLevelListOfSpeakersRepositoryService,
        private cd: ChangeDetectorRef
    ) {}

    ngOnDestroy(): void {
        for (const speakingTimeId of this.subscribedIds) {
            this.subscriptions.get(speakingTimeId).unsubscribe();
        }
    }

    public getStructureLevels(): any {
        return this.structureLevels.values();
    }

    public duration(duration_time: number): string {
        return this.durationService.durationToString(duration_time, `m`).slice(0, -2);
    }
}
