import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { filter, merge, mergeMap, Subscription, tap } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { SpeakerRepositoryService } from 'src/app/gateways/repositories/speakers/speaker-repository.service';
import { StructureLevelListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/structure-level-list-of-speakers';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewSpeaker } from 'src/app/site/pages/meetings/pages/agenda';
import { DurationService } from 'src/app/site/services/duration.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { CurrentSpeakingStructureLevelSlideService } from '../../../../pages/agenda/modules/list-of-speakers/services/current-speaking-structure-level-slide.service';
import { CurrentStructureLevelListSlideService } from '../../../../pages/agenda/modules/list-of-speakers/services/current-structure-level-list-slide.service';
import { ViewStructureLevelListOfSpeakers } from '../../../../pages/participants/pages/structure-levels/view-models';
import { ProjectionBuildDescriptor } from '../../../../view-models';

@Component({
    selector: `os-speaking-times`,
    templateUrl: `./speaking-times.component.html`,
    styleUrls: [`./speaking-times.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeakingTimesComponent implements OnDestroy {
    /**
     * To check permissions in templates using permission.[...]
     */
    public readonly permission = Permission;

    private subscriptions: Map<Id, Subscription> = new Map();

    @ViewChild(`totalTimeDialog`, { static: true })
    private totalTimeDialog: TemplateRef<string> | null = null;

    @ViewChild(`addRemoveTimeDialog`, { static: true })
    private addRemoveTimeDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;
    public totalTimeForm: UntypedFormGroup;
    public addTimeControl: UntypedFormControl;
    public currentEntry: any = null;
    public structureLevels: Map<Id, any> = new Map();

    // if some speaker has spoken.
    public hasSpokenFlag = false;

    @Input()
    public showProjectionMenu = false;

    @Input()
    public set currentSpeakingTimes(speakingTimes: Id[]) {
        const newSpeakingTimes = new Set(speakingTimes);
        const subscribedIds = new Set(this.subscriptions.keys());

        for (const speakingTimeId of subscribedIds.difference(newSpeakingTimes)) {
            this.subscriptions.get(speakingTimeId).unsubscribe();
            this.subscriptions.delete(speakingTimeId);
            this.structureLevels.delete(speakingTimeId);
        }

        for (const speakingTimeId of newSpeakingTimes.difference(subscribedIds)) {
            this.subscriptions.set(
                speakingTimeId,
                this.speakingTimesRepo
                    .getViewModelObservable(speakingTimeId)
                    .pipe(
                        filter(st => !!st?.structure_level),
                        tap(st => this.updateSpeakingTime(st)),
                        mergeMap(st =>
                            merge(
                                ...st.speaker_ids.map(speakerId => this.speakerRepo.getViewModelObservable(speakerId))
                            )
                        )
                    )
                    .subscribe(speaker => {
                        if (speaker) {
                            this.updateSpeakingTime(speaker.structure_level_list_of_speakers);
                        }
                    })
            );
        }
    }

    public constructor(
        private durationService: DurationService,
        private speakingTimesRepo: StructureLevelListOfSpeakersRepositoryService,
        private speakerRepo: SpeakerRepositoryService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef,
        private promptService: PromptService,
        private currentStructureLevelListSlideService: CurrentStructureLevelListSlideService,
        private currentSpeakingStructureLevelSlideService: CurrentSpeakingStructureLevelSlideService,
        private translateService: TranslateService
    ) {
        this.totalTimeForm = this.formBuilder.group({
            totalTime: [0, [Validators.required, Validators.pattern(/^\d+:\d{2}$/)]]
        });
        this.addTimeControl = this.formBuilder.control([0, [Validators.required, Validators.pattern(/^\d+:\d{2}$/)]]);
    }

    public ngOnDestroy(): void {
        for (const speakingTimeId of this.subscriptions.keys()) {
            this.subscriptions.get(speakingTimeId).unsubscribe();
        }
    }

    public duration(duration_time: number): string {
        return this.durationService.durationToString(duration_time, `m`).slice(0, -2);
    }

    public setTotalTime(speakingTimeId: number): void {
        this.currentEntry = this.structureLevels.get(speakingTimeId);
        this.totalTimeForm.get(`totalTime`).setValue(this.duration(this.currentEntry.countdown.countdown_time));
        const dialogSettings = infoDialogSettings;
        this.dialogRef = this.dialog.open(this.totalTimeDialog!, dialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    public structureLevelIsSpeaking(speakingTimeId: number): boolean {
        const sllos = this.speakingTimesRepo.getViewModel(speakingTimeId);
        return !!sllos.current_start_time;
    }

    public async resetTimer(speakingTimeId: number): Promise<void> {
        let sllos = this.speakingTimesRepo.getViewModel(speakingTimeId);
        if (sllos.initial_time === undefined) {
            throw new Error(`Can't reset timer: Initial time not loaded.`);
        }
        const title = this.translateService.instant(`Reset timer`);
        const content =
            this.translateService.instant(
                `Are you sure you want to reset the time to the last set value? It will be reset to:`
            ) +
            ` ` +
            this.duration(sllos.initial_time);
        if (await this.promptService.open(title, content)) {
            sllos = this.speakingTimesRepo.getViewModel(speakingTimeId);
            let initialTime = sllos.initial_time;
            if (initialTime !== undefined) {
                if (sllos.current_start_time) {
                    initialTime = initialTime + Math.floor(Date.now() / 1000 - sllos.current_start_time);
                }
                this.speakingTimesRepo.update([{ id: speakingTimeId, remaining_time: initialTime }]);
            }
        }
    }

    public addRemoveTime(speakingTimeId: number): void {
        this.currentEntry = this.structureLevels.get(speakingTimeId);
        this.addTimeControl.setValue(this.duration(0));
        const dialogSettings = infoDialogSettings;
        this.dialogRef = this.dialog.open(this.addRemoveTimeDialog!, dialogSettings);
    }

    public doAddOrRemoveTime(add: boolean): void {
        if (!this.addTimeControl.value || !this.addTimeControl.valid) {
            return;
        }
        const sllos = this.speakingTimesRepo.getViewModel(this.currentEntry.id);
        this.speakingTimesRepo.update([
            {
                id: this.currentEntry.id,
                remaining_time:
                    sllos.remaining_time +
                    this.durationService.stringToDuration(this.addTimeControl.value, `m`, true) * (+add || -1)
            }
        ]);
    }

    public removeTime(): void {
        if (!this.addTimeControl.value || !this.addTimeControl.valid) {
            return;
        }
        const sllos = this.speakingTimesRepo.getViewModel(this.currentEntry.id);
        this.speakingTimesRepo.update([
            {
                id: this.currentEntry.id,
                initial_time:
                    sllos.remaining_time - this.durationService.stringToDuration(this.addTimeControl.value, `m`, true)
            }
        ]);
    }

    public async distributeOverhangTime(speakingTimeId: number): Promise<void> {
        const entry = this.structureLevels.get(speakingTimeId);
        const countdownTime = entry.countdown.countdown_time;
        if (countdownTime < 0) {
            const title = this.translateService.instant(`Distribute overhang time`);
            const content =
                this.translateService.instant(
                    `Are you sure you want to add the following time onto every structure level?`
                ) +
                ` ` +
                this.duration(Math.abs(countdownTime));
            if (await this.promptService.open(title, content)) {
                this.speakingTimesRepo.add_time([{ id: speakingTimeId }]);
            }
        }
    }

    public isInOvertimeAndNotSpeaking(speakingTimeId: number): boolean {
        const entry = this.structureLevels.get(speakingTimeId);
        return entry.countdown.countdown_time < 0 && !this.checkSpeaking(entry.speakers);
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.save();
            this.dialogRef!.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef!.close();
        }
    }

    private updateSpeakingTime(speakingTime: ViewStructureLevelListOfSpeakers): void {
        if (speakingTime) {
            if (speakingTime.isInactive) {
                this.structureLevels.delete(speakingTime.id);
            } else {
                const remaining = speakingTime.remaining_time;
                this.structureLevels.set(speakingTime.id, {
                    name: speakingTime.structure_level.getTitle(),
                    color: speakingTime.structure_level.color,
                    countdown: {
                        running: !!speakingTime.current_start_time,
                        countdown_time: speakingTime.current_start_time
                            ? speakingTime.current_start_time + remaining
                            : remaining
                    },
                    id: speakingTime.id,
                    speakers: speakingTime.speakers
                });
            }
        }
        this.cd.markForCheck();
    }

    private checkSpeaking(speakers: ViewSpeaker[]): boolean {
        for (const speaker of speakers) {
            const loaded_speaker = this.speakerRepo.getViewModel(speaker.id);
            if (loaded_speaker.isCurrentSpeaker) {
                return true;
            }
        }
        return false;
    }

    private save(): void {
        if (!this.totalTimeForm.value || !this.totalTimeForm.valid) {
            return;
        }
        this.speakingTimesRepo.update([
            {
                id: this.currentEntry.id,
                initial_time: this.durationService.stringToDuration(
                    this.totalTimeForm.get(`totalTime`).value,
                    `m`,
                    true
                )
            }
        ]);
    }

    public getAllStructureLevel(): ProjectionBuildDescriptor {
        return this.currentStructureLevelListSlideService.getProjectionBuildDescriptor(false);
    }

    public getCurrentStructureLevel(): ProjectionBuildDescriptor {
        return this.currentSpeakingStructureLevelSlideService.getProjectionBuildDescriptor(true);
    }
}
