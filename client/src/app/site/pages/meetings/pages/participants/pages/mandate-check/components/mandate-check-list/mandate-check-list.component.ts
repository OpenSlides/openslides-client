import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

import { GroupControllerService, ViewGroup } from '../../../../modules';
import { ParticipantControllerService } from '../../../../services/common/participant-controller.service';

const FEMALE_GENDER_ID = 2;

class MandateCheckEntry implements Identifiable {
    public id = -1;
    public name = ``;
    public presentUserIds: Id[] = [];
    public absentUserIds: Id[] = [];
    public presentFemaleUserIds: Id[] = [];
    public absentFemaleUserIds: Id[] = [];

    public constructor(name: string, id: Id) {
        this.name = name;
        this.id = id;
    }

    public add(userId: Id, present: boolean, female: boolean): void {
        if (present) {
            this.presentUserIds.push(userId);
            if (female) {
                this.presentFemaleUserIds.push(userId);
            }
        } else {
            this.absentUserIds.push(userId);
            if (female) {
                this.absentFemaleUserIds.push(userId);
            }
        }
    }

    public getTotalCount(female?: boolean): number {
        if (female) {
            return this.presentFemaleUserIds.length + this.absentFemaleUserIds.length;
        }
        return this.presentUserIds.length + this.absentUserIds.length;
    }

    public getPercent(female?: boolean): number {
        const total = this.getTotalCount(female);
        const part = female ? this.presentFemaleUserIds.length : this.presentUserIds.length;
        return part / total;
    }
}

@Component({
    selector: 'os-mandate-check-list',
    imports: [
        TranslateModule,
        HeadBarModule,
        ListModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule
    ],
    templateUrl: './mandate-check-list.component.html',
    styleUrl: './mandate-check-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MandateCheckListComponent extends BaseMeetingComponent implements OnInit {
    public structureLevels = [];
    public entriesObservable = new BehaviorSubject<MandateCheckEntry[]>([]);
    public groups: ViewGroup[] = [];
    public participants: ViewUser[] = [];
    public selectedGroups: Id[] = [];
    public form: UntypedFormGroup = null;

    public constructor(
        private participantRepo: ParticipantControllerService,
        private structureLevelRepo: StructureLevelRepositoryService,
        private groupRepo: GroupControllerService,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.structureLevelRepo.getViewModelListObservable().subscribe(strLvls => {
                this.structureLevels = strLvls;
                this.cd.markForCheck();
            })
        );
        this.subscriptions.push(
            this.participantRepo.getViewModelListObservable().subscribe(participants => {
                this.participants = participants;
                this.updateEntries();
                this.cd.markForCheck();
            })
        );
        this.subscriptions.push(
            this.groupRepo.getViewModelListObservable().subscribe(groups => (this.groups = groups))
        );

        this.form = this.formBuilder.group({ groups: [] });
        this.form.valueChanges.subscribe(values => {
            this.selectedGroups = values.groups;
            this.updateEntries();
            this.cd.markForCheck();
        });
    }

    public displayPercent(value: number): string {
        return `${Number(value * 100).toFixed(0)}%`;
    }

    private updateEntries(): void {
        const filteredParticipants = this.participants.filter(pt =>
            (this.selectedGroups ?? []).some(id => pt.group_ids().includes(id))
        );
        const allMandates = new MandateCheckEntry(`All Mandates`, -1);
        const structureLevelsEntryMap = new Map<Id, MandateCheckEntry>();
        for (const strLvl of this.structureLevels ?? []) {
            structureLevelsEntryMap.set(strLvl.id, new MandateCheckEntry(strLvl.name, strLvl.id));
        }
        for (const participant of filteredParticipants) {
            allMandates.add(
                participant.id,
                participant.isPresentInMeeting(),
                participant.gender_id === FEMALE_GENDER_ID
            );
            for (const strLvlId of participant.structure_level_ids() ?? []) {
                if (this.structureLevels.length) {
                    structureLevelsEntryMap
                        .get(strLvlId)
                        .add(
                            participant.id,
                            participant.isPresentInMeeting(),
                            participant.gender_id === FEMALE_GENDER_ID
                        );
                }
            }
        }
        const sortedEntries = [...structureLevelsEntryMap.values()].sort((a, b) => a.name.localeCompare(b.name));
        this.entriesObservable.next([allMandates, ...sortedEntries]);
    }
}
