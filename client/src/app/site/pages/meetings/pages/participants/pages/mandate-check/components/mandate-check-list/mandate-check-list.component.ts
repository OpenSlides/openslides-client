import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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

import { GroupControllerService, ViewGroup } from '../../../../modules';
import { ParticipantControllerService } from '../../../../services/common/participant-controller.service';

const FEMALE_GENDER_ID = 2;
const ALL_MANDATES_ID = -1;

class MandateCheckEntry implements Identifiable {
    public id = ALL_MANDATES_ID;
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
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatProgressBarModule,
        MatSelectModule
    ],
    templateUrl: './mandate-check-list.component.html',
    styleUrl: './mandate-check-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MandateCheckListComponent extends BaseMeetingComponent implements OnDestroy, OnInit {
    public structureLevels = [];
    public entriesObservable = new BehaviorSubject<MandateCheckEntry[]>([]);
    public entries: MandateCheckEntry[] = [];
    public groups: ViewGroup[] = [];
    public participants: ViewUser[] = [];
    public selectedGroups: Id[] = [];
    public form: UntypedFormGroup = null;
    public toggleMap = new Map<Id, boolean>();

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
                this.updateToggleMap();
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

        this.storage.get<Id[]>(`mandate-check-groups`).then(groups => this.form.get(`groups`).setValue(groups));
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.storage.set(`mandate-check-groups`, this.selectedGroups);
    }

    public displayPercent(value: number): string {
        if (Number.isNaN(value)) {
            return ``;
        }
        return `(${Number(value * 100).toFixed(0)}%)`;
    }

    public toggle(structureLevelId: Id): void {
        this.toggleMap.set(structureLevelId, !(this.toggleMap.get(structureLevelId) ?? true));
    }

    public getName(userId: Id): string {
        return this.participantRepo.getViewModel(userId).getShortName();
    }

    public getOfFemales(value: number): string {
        const label = this.translate.instant(`of this %num% female`).replace(`%num%`, value);
        return label;
    }

    private updateEntries(): void {
        const filteredSortedParticipants = this.participants
            .filter(pt => (this.selectedGroups ?? []).some(id => pt.group_ids().includes(id)))
            .sort((a, b) => a.short_name.localeCompare(b.short_name));
        const allMandates = new MandateCheckEntry(`All Mandates`, ALL_MANDATES_ID);
        const structureLevelsEntryMap = new Map<Id, MandateCheckEntry>();
        for (const strLvl of this.structureLevels ?? []) {
            structureLevelsEntryMap.set(strLvl.id, new MandateCheckEntry(strLvl.name, strLvl.id));
        }
        for (const participant of filteredSortedParticipants) {
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
        this.entries = [allMandates, ...sortedEntries];
        this.entriesObservable.next([allMandates, ...sortedEntries]);
    }

    private updateToggleMap(): void {
        const newMap = new Map<Id, boolean>();
        newMap.set(ALL_MANDATES_ID, this.toggleMap.get(ALL_MANDATES_ID) ?? false);
        for (const strlvl of this.structureLevels) {
            newMap.set(strlvl.id, this.toggleMap.get(strlvl.id) ?? false);
        }
        this.toggleMap = newMap;
    }
}
