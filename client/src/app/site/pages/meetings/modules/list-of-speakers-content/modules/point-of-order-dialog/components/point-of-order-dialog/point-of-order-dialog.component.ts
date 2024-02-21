import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import { BehaviorSubject, combineLatest, firstValueFrom, map } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewListOfSpeakers, ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserSelectionData } from '../../../../../participant-search-selector';
import { Id } from 'src/app/domain/definitions/key-types';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service';
import { SpeakerControllerService } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/services';

@Component({
    selector: `os-point-of-order-dialog`,
    templateUrl: `./point-of-order-dialog.component.html`,
    styleUrls: [`./point-of-order-dialog.component.scss`]
})
export class PointOfOrderDialogComponent {
    /**
     * To check permissions in templates using permission.[...]
     */
    public readonly permission = Permission;

    public get canManage(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }
    
    public get canSetPoOsForOthers(): boolean {
        return this.meetingSettingsService.instant(`list_of_speakers_can_create_point_of_order_for_others`) ?? false;
    }

    public users: ViewUser[] = [];
    public nonAvailableUserIds: number[] = [];

    public speaker: ViewUser;

    private get onlyPresentUsers(): boolean {
        return this.meetingSettingsService.instant(`list_of_speakers_present_users_only`) ?? false;
    }

    public editForm: UntypedFormGroup;

    public readonly MAX_LENGTH = 80;

    public title: string;

    public categoriesSubject = new BehaviorSubject<ViewPointOfOrderCategory[]>([]);

    public get showCategorySelect(): boolean {
        return this._showCategorySelect;
    }

    private _showCategorySelect = false;

    private _currentUser: ViewUser | null = null;

    public constructor(
        public readonly dialogRef: MatDialogRef<PointOfOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public readonly listOfSpeakers: ViewListOfSpeakers,
        private fb: UntypedFormBuilder,
        private meetingSettings: MeetingSettingsService,
        private activeMeeting: ActiveMeetingService,
        private operator: OperatorService,
        private meetingSettingsService: MeetingSettingsService,
        private speakerRepo: SpeakerControllerService
    ) {
        this.activeMeeting.meeting.point_of_order_categories_as_observable
            .pipe(
                map(categories =>
                    categories.sort((a, b) => {
                        const comparison = a.text.localeCompare(b.text);
                        return comparison || a.rank - b.rank;
                    })
                )
            )
            .subscribe(this.categoriesSubject);

        this.editForm = this.fb.group({
            note: [``, [Validators.maxLength(this.MAX_LENGTH)]],
            category: [],
            speaker: []
        });

        this.operator.userObservable.subscribe(user => (this._currentUser = user)),

        combineLatest([
            this.meetingSettings.get(`list_of_speakers_enable_point_of_order_categories`),
            this.categoriesSubject
        ]).subscribe(([enabled, categories]) => {
            const show = categories.length && enabled;
            const categoryForm = this.editForm.get(`category`);
            if (show) {
                categoryForm.setValidators([Validators.required]);
                if (!categories.map(cat => cat.id).includes(categoryForm.value)) {
                    categoryForm.setValue(categories[0].id);
                }
            } else {
                categoryForm.clearValidators();
            }
            this.editForm.updateValueAndValidity();
            this._showCategorySelect = show;
        });

        this.filterNonAvailableUsers();
    }

    public onOk(): void {
        if (!this.editForm.valid) {
            return;
        }
        const note = this.editForm.value.note || undefined;
        const speaker = this.editForm.value.speaker || undefined;
        const point_of_order_category_id = this._showCategorySelect
            ? this.editForm.value.category || undefined
            : undefined;
        this.dialogRef.close({ note, point_of_order_category_id, speaker });
    }

    public onCancel(): void {
        this.dialogRef.close();
    }

    /**
     * Creates an array of users who currently shouldn't be selectable for the speaker list.
     */
    private filterNonAvailableUsers() {
        const nonAvailableUsers = this.users
            .filter(
                user =>
                    !(!this.onlyPresentUsers || user?.isPresentInMeeting())
            )
            .map(user => user?.id)
            .filter(user => !!user);
        this.nonAvailableUserIds = nonAvailableUsers;
    }

    public selectUser(data: UserSelectionData): UserSelectionData {
        if (!data.userId) {
            data.userId = this.operator.operatorId;
        }  
        this.speaker = this.users.find(speaker => speaker.id === data.userId);
        this.editForm.value.speaker = data;
        return data;
    }

    public getSelectedUser(): ViewUser {
        return this.speaker;
    }
}
