import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { ParticipantControllerService } from '../../../../services/common/participant-controller.service';

const FEMALE_GENDER_ID = 2;

class MandateCheckEntry {
    public name = ``;
    public presentUserIds: Id[] = [];
    public absentUserIds: Id[] = [];
    public presentFemaleUserIds: Id[] = [];
    public abentFemaleUserIds: Id[] = [];

    public constructor(name: string) {
        this.name = name;
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
                this.abentFemaleUserIds.push(userId);
            }
        }
    }

    public getTotalCount(female?: boolean): number {
        if (female) {
            return this.presentFemaleUserIds.length + this.abentFemaleUserIds.length;
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
    imports: [TranslateModule, HeadBarModule],
    templateUrl: './mandate-check-list.component.html',
    styleUrl: './mandate-check-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MandateCheckListComponent extends BaseMeetingComponent implements OnInit {
    public structureLevels = [];
    public entries: MandateCheckEntry[] = [];

    public constructor(
        private participantRepo: ParticipantControllerService,
        private structureLevelRepo: StructureLevelRepositoryService,
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
        // const selectedGroups = [];
        this.subscriptions.push(
            this.participantRepo
                .getViewModelListObservable()
                .subscribe(participants => this.updateEntries(participants))
        );
    }

    private updateEntries(participants: ViewUser[]): void {
        const allMandates = new MandateCheckEntry(`All Mandates`);
        for (const participant of participants) {
            allMandates.add(
                participant.id,
                participant.isPresentInMeeting(),
                participant.gender_id === FEMALE_GENDER_ID
            );
        }
        this.entries = [allMandates];
    }
}
