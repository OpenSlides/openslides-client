import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { StructureLevelListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/structure-level-list-of-speakers';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { DurationService } from 'src/app/site/services/duration.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

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

    private subscribedIds: Set<Id> = new Set();
    private subscriptions: Map<Id, Subscription> = new Map();
    private structureLevels: Map<Id, any> = new Map();

    @ViewChild(`totalTimeDialog`, { static: true })
    private totalTimeDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;
    public totalTimeForm: UntypedFormGroup;
    public currentEntry: any = null;

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
                        },
                        id: speakingTimeId
                    });
                    this.cd.markForCheck();
                })
            );
        }
    }

    constructor(
        private durationService: DurationService,
        private speakingTimesRepo: StructureLevelListOfSpeakersRepositoryService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef,
        private promptService: PromptService,
        private translateService: TranslateService
    ) {
        this.totalTimeForm = this.formBuilder.group({
            totalTime: [0, Validators.required]
        });
    }

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

    /**
     * an dialog should open with:
     * title: "Change total time of `structure_level_name`"
     * input (required and required >=0) field with new time
     * warn-text: "this will overwrite the current time"
     * buttons: OK and Cancel
     *
     * the countdown the structure level with the structure_level id should
     * be set to whatever number time was given
     */
    public setTotalTime(speakingTimeId: number): void {
        this.currentEntry = this.structureLevels.get(speakingTimeId);
        this.totalTimeForm.get(`totalTime`).setValue(this.currentEntry.countdown.countdown_time);
        const dialogSettings = infoDialogSettings;
        this.dialogRef = this.dialog.open(this.totalTimeDialog!, dialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * an dialog should open with:
     * title: "Distribute overhang time"
     * text: "Are you sure you want add `overhang time-from-structure-level` onto every structure level?"
     * buttons: OK and Cancel
     * the overhang time from the structure level should he added onto every structure level
     * Example:
     * If level A has 20 sec left and level B an overhang from -30sec
     * the level A should have (after distributing B's overhang time) 50 sec
     * and B should have 0 secs
     */
    public async distributOverhangTime(speakingTimeId: number): Promise<void> {
        const entry = this.structureLevels.get(speakingTimeId);
        const countdownTime = entry.countdown.countdown_time;
        if (countdownTime < 0) {
            const title = this.translateService.instant(`Distribute overhang time`);
            const content = this.translateService.instant(
                `Are you sure you want add ${Math.abs(countdownTime)} s onto every structure level?`
            );
            if (await this.promptService.open(title, content)) {
                // Update the countdowns
                for (const tmpId of this.subscribedIds) {
                    this.structureLevels.get(tmpId).countdown.countdown_time += Math.abs(countdownTime);
                }
                // TODO: send update action "add_time"(?)
            }
        }
    }

    /**
     * return true if structure level is in overtime (countdown time < 0)
     */
    public isInOvertime(speakingTimeId: number): boolean {
        const entry = this.structureLevels.get(speakingTimeId);
        return entry.countdown.countdown_time < 0;
    }

    /**
     * clicking Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.save();
            this.dialogRef!.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef!.close();
        }
    }

    /**
     * save the form value into the counter
     */
    private save(): void {
        if (!this.totalTimeForm.value || !this.totalTimeForm.valid) {
            return;
        }
        this.currentEntry.countdown.countdown_time = this.totalTimeForm.get(`totalTime`).value;
        console.log(`save`, this.totalTimeForm.value);
    }
}
