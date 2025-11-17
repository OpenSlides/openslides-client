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
import { GenderControllerService } from 'src/app/site/pages/organization/pages/accounts/pages/gender/services/gender-controller.service';
import { ViewGender } from 'src/app/site/pages/organization/pages/accounts/pages/gender/view-models/view-gender';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { GroupControllerService, ViewGroup } from '../../../../modules';
import { ParticipantControllerService } from '../../../../services/common/participant-controller.service';

const FEMALE_ID = 2;
const MALE_ID = 1;
const ALL_MANDATES_ID = -1;

class GenderEntry implements Identifiable {
    public label: string;
    public id: Id;
    public present: number;
    public absent: number;

    public constructor(id: Id, label: string) {
        this.id = id;
        this.label = label;
        this.present = 0;
        this.absent = 0;
    }

    public add(present: boolean): void {
        if (present) {
            this.present += 1;
        } else {
            this.absent += 1;
        }
    }
}
class MandateCheckEntry implements Identifiable {
    public id = ALL_MANDATES_ID;
    public name = ``;
    public presentUserIds: Id[] = [];
    public absentUserIds: Id[] = [];
    public genderEntryMap: Map<Id, GenderEntry> = new Map<Id, GenderEntry>();

    public constructor(name: string, id: Id, genders: ViewGender[]) {
        this.name = name;
        this.id = id;

        for (const gender of genders) {
            this.genderEntryMap.set(gender.id, new GenderEntry(gender.id, gender.name));
        }
    }

    public add(userId: Id, present: boolean, genderId: Id | null): void {
        if (present) {
            this.presentUserIds.push(userId);
        } else {
            this.absentUserIds.push(userId);
        }
        this.genderEntryMap.get(genderId)?.add(present);
    }

    public getTotalCount(genderId?: Id): number {
        if (genderId) {
            const genderEntry = this.genderEntryMap.get(genderId);
            return (genderEntry?.present ?? 0) + (genderEntry?.absent ?? 0);
        }
        return this.presentUserIds.length + this.absentUserIds.length;
    }

    public getPercent(genderId?: Id): number {
        const total = this.getTotalCount(genderId);
        const part = genderId ? this.genderEntryMap.get(genderId)?.present : this.presentUserIds.length;
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
    public genderIds: Id[] = [2, 1, 3, 4];
    public genders: ViewGender[] = [];
    public selectedGroups: Id[] = [];
    public form: UntypedFormGroup = null;
    public toggleMap = new Map<Id, boolean>();

    public constructor(
        private participantRepo: ParticipantControllerService,
        private structureLevelRepo: StructureLevelRepositoryService,
        private groupRepo: GroupControllerService,
        private genderRepo: GenderControllerService,
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
        this.genders = this.genderRepo.getViewModelList();
        // female at first place
        if (
            this.genders.some(gender => gender.id === MALE_ID) &&
            this.genders.some(gender => gender.id === FEMALE_ID)
        ) {
            this.genders = [this.genders[1], this.genders[0], ...this.genders.slice(2)];
        }
        const allMandates = new MandateCheckEntry(`All Mandates`, ALL_MANDATES_ID, this.genders);
        const structureLevelsEntryMap = new Map<Id, MandateCheckEntry>();
        for (const strLvl of this.structureLevels ?? []) {
            structureLevelsEntryMap.set(strLvl.id, new MandateCheckEntry(strLvl.name, strLvl.id, this.genders));
        }
        for (const participant of filteredSortedParticipants) {
            allMandates.add(participant.id, participant.isPresentInMeeting(), participant.gender_id);
            for (const strLvlId of participant.structure_level_ids() ?? []) {
                if (this.structureLevels.length) {
                    structureLevelsEntryMap
                        .get(strLvlId)
                        .add(participant.id, participant.isPresentInMeeting(), participant.gender_id);
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
