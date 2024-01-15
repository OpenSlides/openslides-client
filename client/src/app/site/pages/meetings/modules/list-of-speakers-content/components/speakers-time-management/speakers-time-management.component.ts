import { ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { StructureLevelListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/structure-level-list-of-speakers';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { DurationService } from 'src/app/site/services/duration.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-speakers-time-management`,
    templateUrl: `./speakers-time-management.component.html`,
    styleUrls: [`./speakers-time-management.component.scss`]
})
export class SpeakersTimeManagementComponent extends BaseMeetingComponent implements OnDestroy {
    public myDataSource = [];
    public displayedColumns = [`structure_level`, `total_time`, `overhang_time`];
    public enableProContraSpeech = false;
    public timeEdit = false;
    public timeFormControls = new FormGroup({});
    @ViewChild(`stmtable`)
    public stmtable;

    private mySubscriptions: Map<Id, Subscription> = new Map();
    private subscribedIds: Set<Id> = new Set();

    @Input()
    public set currentSpeakingTimes(speakingTimes: Id[]) {
        if (!speakingTimes) {
            return;
        }
        const newSpeakingTimes = new Set(speakingTimes);

        for (const speakingTimeId of this.subscribedIds.difference(newSpeakingTimes)) {
            this.subscribedIds.delete(speakingTimeId);
            this.mySubscriptions.get(speakingTimeId).unsubscribe();
            this.mySubscriptions.delete(speakingTimeId);
            this.myDataSource = this.myDataSource.filter(obj => obj.id != speakingTimeId);
        }

        for (const speakingTimeId of newSpeakingTimes.difference(this.subscribedIds)) {
            this.subscribedIds.add(speakingTimeId);
            this.mySubscriptions.set(
                speakingTimeId,
                this.speakingTimesRepo.getViewModelObservable(speakingTimeId).subscribe(speakingTime => {
                    if (speakingTime) {
                        this.setSpeakersTime(speakingTime);
                        this.stmtable?.renderRows();
                    }
                })
            );
        }
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private durationService: DurationService,
        private speakingTimesRepo: StructureLevelListOfSpeakersRepositoryService,
        private promptService: PromptService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
    }

    override ngOnDestroy() {
        for (const speakingTimeId of this.subscribedIds) {
            this.mySubscriptions.get(speakingTimeId).unsubscribe();
        }
        super.ngOnDestroy();
    }

    public toggleEdit(): void {
        this.timeEdit = !this.timeEdit;
        if (this.timeEdit) {
            this.setFormControls();
        }
    }

    public duration(value: number): string {
        return this.durationService.durationToString(value, `m`).slice(0, -2);
    }

    public saveTimes(): void {
        for (const entry of this.myDataSource) {
            entry.total_time = this.durationService.stringToDuration(
                this.timeFormControls.get(this.getFormControlId(entry.id)).value,
                `m`,
                true
            );
            if (entry.total_time < 0) {
                entry.overhang_time = Math.abs(entry.total_time);
            }
        }
        this.timeEdit = false;
    }

    public getFormControlId(id: number) {
        return `fc_${id}`;
    }

    private setSpeakersTime(speakingTime: any) {
        for (const entry of this.myDataSource) {
            if (entry.id == speakingTime.id) {
                this.fillDataSourceEntry(entry, speakingTime);
                return;
            }
        }
        const newEntry = { id: speakingTime.id };
        this.fillDataSourceEntry(newEntry, speakingTime);
        this.myDataSource.push(newEntry);
    }

    private fillDataSourceEntry(entry: any, speakingTime: any) {
        entry.structure_level = speakingTime.structure_level.getTitle();
        entry.color = speakingTime.structure_level.color;
        entry.total_time = speakingTime.remaining_time + (speakingTime.additional_time || 0);
        entry.overhang_time =
            speakingTime.remaining_time + (speakingTime.additional_time || 0) < 0
                ? Math.abs(speakingTime.remaining_time + (speakingTime.additional_time || 0))
                : 0;
    }

    private setFormControls(): void {
        const controlMap: any = {};
        for (const entry of this.myDataSource) {
            controlMap[this.getFormControlId(entry.id)] = new FormControl(
                this.duration(entry[`total_time`]),
                Validators.compose([Validators.required, Validators.pattern(/^-?\d+:\d{2}$/)])
            );
        }
        this.timeFormControls = new FormGroup(controlMap);
    }

    public async promptAddOverhangTime(added: number): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to distribute the Overhang time onto all groups?`);
        const add_time = this.duration(added);
        const content = this.translate.instant(`All total timers will have an additional`) + ` ${add_time}min.`;
        if (await this.promptService.open(title, content)) {
            this.addOverhangTime(added);
        }
    }

    private addOverhangTime(added: number): void {
        for (const entry of this.myDataSource) {
            entry.total_time += added;
            if (entry.total_time < 0) {
                entry.overhang_time = Math.abs(entry.total_time);
            } else {
                entry.overhang_time = 0;
            }
        }
        this.cd.detectChanges();
    }
}
