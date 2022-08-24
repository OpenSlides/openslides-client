import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable, Selectable } from 'src/app/domain/interfaces';
import { BaseComponent } from 'src/app/site/base/base.component';
import {
    MeetingControllerService,
    MeetingUserModifiedFields
} from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationTagControllerService } from 'src/app/site/pages/organization/pages/organization-tags/services/organization-tag-controller.service';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models';

const ADD_MEETING_LABEL = _(`New meeting`);
const EDIT_MEETING_LABEL = _(`Edit meeting`);

const ORGA_ADMIN_ALLOWED_CONTROLNAMES = [`user_ids`, `admin_ids`];

const TEMPLATE_MEETINGS_LABEL: Selectable = {
    id: -1,
    getTitle: () => `Template meetings`,
    getListTitle: () => `Template meetings`,
    disabled: true
};

const ACTIVE_MEETINGS_LABEL: Selectable = {
    id: -2,
    getTitle: () => `Active meetings`,
    getListTitle: () => `Active meetings`,
    disabled: true
};

const ARCHIVED_MEETINGS_LABEL: Selectable = {
    id: -3,
    getTitle: () => `Archived meetings`,
    getListTitle: () => `Archived meetings`,
    disabled: true
};

@Component({
    selector: `os-meeting-edit`,
    templateUrl: `./meeting-edit.component.html`,
    styleUrls: [`./meeting-edit.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingEditComponent extends BaseComponent implements OnInit {
    public readonly availableUsers: Observable<ViewUser[]>;

    public availableMeetingsObservable: Observable<Selectable[]> | null = null;

    public get timeMessage(): string {
        if (this._lastDateSet === `start`) {
            return _(`Due to inverted date settings, the start date's value will be used for both dates.`);
        } else if (this._lastDateSet === `end`) {
            return _(`Due to inverted date settings, the end date's value will be used for both dates.`);
        }
        return _(`The end date needs to be later than the start date.`);
    }

    public get isValid(): boolean {
        return this.meetingForm?.valid;
    }

    public get isTimeValid(): boolean {
        const start = this.meetingForm?.get(`start_time`).value;
        const end = this.meetingForm?.get(`end_time`).value;
        if (!!start && (!!end || end === 0)) {
            return start <= end;
        }
        return true;
    }

    private get isJitsiManipulationAllowed(): boolean {
        return !this.isCreateView && this.operator.isSuperAdmin;
    }

    private get isMeetingAdmin(): boolean {
        if (!this.meetingId || !this.operatingUser || !this.editMeeting) {
            return false;
        }
        return this.operatingUser.group_ids(this.meetingId).includes(this.editMeeting.admin_group_id);
    }

    public addMeetingLabel = ADD_MEETING_LABEL;
    public editMeetingLabel = EDIT_MEETING_LABEL;

    public isCreateView: boolean = false;

    public meetingForm!: UntypedFormGroup;
    public theDuplicateFromId: Id | null = null;

    public sortFn: (valueA: Selectable, valueB: Selectable) => number = (a, b) => {
        return a && typeof a.getTitle() === `string` ? a.getTitle().localeCompare(b.getTitle()) : -1;
    };

    public committee!: ViewCommittee;

    private meetingId: Id | null = null;
    private editMeeting: ViewMeeting | null = null;
    private committeeId!: Id;

    /**
     * The operating user received from the OperatorService
     */
    private operatingUser: ViewUser | null = null;

    // private _timeEditingTimeoutId: NodeJS.Timeout;

    private _lastDateSet: `start` | `end`;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private meetingRepo: MeetingControllerService,
        private committeeRepo: CommitteeControllerService,
        public orgaTagRepo: OrganizationTagControllerService,
        private operator: OperatorService,
        private userRepo: UserControllerService,
        private openslidesRouter: OpenSlidesRouterService,
        private orga: OrganizationService
    ) {
        super(componentServiceCollector, translate);
        this.checkCreateView();
        this.createForm();
        this.init();

        if (this.isCreateView) {
            super.setTitle(ADD_MEETING_LABEL);
        } else {
            super.setTitle(EDIT_MEETING_LABEL);
        }

        this.availableUsers = userRepo.getViewModelListObservable();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.operator.userObservable.subscribe(user => {
                // We need here the user from the operator, because the operator holds not all groups in all meetings they are
                this.operatingUser = user;
                this.onAfterCreateForm();
            }),
            this.meetingForm.controls[`start_time`].valueChanges.subscribe(start_time => (this._lastDateSet = `start`)),
            this.meetingForm.controls[`end_time`].valueChanges.subscribe(end_time => (this._lastDateSet = `end`))
        );

        this.availableMeetingsObservable = this.orga.organizationObservable.pipe(
            map(organization => {
                return [
                    TEMPLATE_MEETINGS_LABEL,
                    ...organization.template_meetings.sort(this.sortFn),
                    ACTIVE_MEETINGS_LABEL,
                    ...organization.active_meetings.sort(this.sortFn),
                    ARCHIVED_MEETINGS_LABEL,
                    ...organization.archived_meetings.sort(this.sortFn)
                ];
            })
        );
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.onSubmit();
    }

    public async onSubmit(): Promise<void> {
        this.makeDatesValid();
        if (this.isCreateView) {
            await this.doCreateMeeting();
        } else {
            await this.doUpdateMeeting();
        }
    }

    public onCancel(): void {
        this.goBack();
    }

    public async onOrgaTagNotFound(orgaTagName: string): Promise<void> {
        const { id }: Identifiable = (
            await this.orgaTagRepo.create({
                name: orgaTagName
            })
        )[0];
        const currentValue: Id[] = this.meetingForm.get(`organization_tag_ids`)!.value || [];
        this.meetingForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
    }

    public onUpdateDuplicateFrom(id: Id | null): void {
        this.theDuplicateFromId = id;
    }

    private checkCreateView(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === `create`) {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
        }
    }

    private init(): void {
        this.subscriptions.push(
            this.openslidesRouter.currentParamMap.subscribe(params => {
                if (params[`committeeId`]) {
                    this.committeeId = Number(params[`committeeId`]);
                    this.loadCommittee();
                }
                if (params[`meetingId`]) {
                    this.meetingId = Number(params[`meetingId`]);
                    this.loadMeeting();
                }
            })
        );
    }

    private loadMeeting(): void {
        this.subscriptions.push(
            this.meetingRepo.getViewModelObservable(this.meetingId!).subscribe(meeting => {
                if (meeting) {
                    this.editMeeting = meeting;
                    this.updateForm(this.editMeeting);
                }
            })
        );
    }

    private loadCommittee(): void {
        this.subscriptions.push(
            this.committeeRepo.getViewModelObservable(this.committeeId).subscribe(committee => {
                if (committee) {
                    this.committee = committee;
                    this.updateFormByCommittee();
                }
            })
        );
    }

    private createForm(): void {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const rawForm: { [key: string]: any } = {
            name: [``, Validators.required],
            description: [``],
            location: [``],
            start_time: [currentDate],
            end_time: [currentDate],
            user_ids: [[]],
            admin_ids: [[], Validators.minLength(1)],
            organization_tag_ids: [[]]
        };

        if (this.isJitsiManipulationAllowed) {
            rawForm[`jitsi_domain`] = [``, Validators.pattern(/^(?!https:\/\/).*(?<!\/)$/)];
            rawForm[`jitsi_room_name`] = [``];
            rawForm[`jitsi_room_password`] = [``];
        }

        this.meetingForm = this.formBuilder.group(rawForm);
        this.onAfterCreateForm();
    }

    private onAfterCreateForm(): void {
        this.enableFormControls();
        if (!this.isMeetingAdmin && !this.isCreateView) {
            Object.keys(this.meetingForm.controls).forEach(controlName => {
                if (!ORGA_ADMIN_ALLOWED_CONTROLNAMES.includes(controlName)) {
                    this.meetingForm.get(controlName)!.disable();
                }
            });
        }
    }

    private updateForm(meeting: ViewMeeting): void {
        const patchMeeting: any = meeting.getUpdatedModelData({
            start_time: meeting.start_time ? new Date(meeting.start_time * 1000) : undefined,
            end_time: meeting.end_time ? new Date(meeting.end_time * 1000) : undefined,
            user_ids: [...(meeting.default_group?.user_ids || [])],
            admin_ids: [...(meeting.admin_group?.user_ids || [])]
        } as any);
        this.meetingForm.patchValue(patchMeeting);
        this.onAfterCreateForm();
    }

    private updateFormByCommittee(): void {
        if (this.isCreateView) {
            const update: any = {
                name: `${this.committee?.name} (${this.committee?.meeting_ids?.length + 1 || 1})`
            };
            if ((this.committee?.user_ids || []).includes(this.operator.operatorId!)) {
                update.admin_ids = [this.operator.operatorId];
            }
            this.meetingForm.patchValue(update);
        }
    }

    private async doCreateMeeting(): Promise<void> {
        if (this.theDuplicateFromId) {
            const from = { meeting_id: this.theDuplicateFromId, ...this.meetingForm.value };
            await this.meetingRepo.duplicateFrom(this.committeeId, from).resolve();
        } else {
            const payload = { committee_id: this.committeeId, ...this.meetingForm.value };
            await this.meetingRepo.create(payload).resolve();
        }
        this.goBack();
    }

    private async doUpdateMeeting(): Promise<void> {
        const payload = { ...this.meetingForm.value };
        await this.meetingRepo.update(this.sanitizePayload(payload), {
            meeting: this.editMeeting!,
            options: this.getUsersToUpdateForMeetingObject()
        });
        this.goBack();
    }

    /**
     * Creates an object containing added and removed participant-user-ids as well as
     * added and removed admin-user-ids for the current editted meeting.
     *
     * @returns A `MeetingUserModifiedFields`-object containing the keys `addedUsers`, `removedUsers`, `addedAdmins`
     * and `removedAdmins`
     */
    private getUsersToUpdateForMeetingObject(): MeetingUserModifiedFields {
        const nextUserIds = this.meetingForm.value.user_ids as Id[];
        const previousUserIds = this.editMeeting!.default_group.user_ids || [];
        const addedUserIds = (nextUserIds || []).difference(previousUserIds);
        const removedUserIds = previousUserIds.difference(nextUserIds);
        const nextAdminIds = this.meetingForm.value.admin_ids as Id[];
        const previousAdminIds = this.editMeeting!.admin_group.user_ids || [];
        const addedAdminIds = (nextAdminIds || []).difference(previousAdminIds);
        const removedAdminIds = previousAdminIds.difference(nextAdminIds);

        return {
            addedUsers: addedUserIds.map(id => this.userRepo.getViewModel(id) as ViewUser),
            removedUsers: removedUserIds.map(id => this.userRepo.getViewModel(id) as ViewUser),
            addedAdmins: addedAdminIds.map(id => this.userRepo.getViewModel(id) as ViewUser),
            removedAdmins: removedAdminIds.map(id => this.userRepo.getViewModel(id) as ViewUser)
        };
    }

    /**
     * Removes the `user_ids` and `admin_ids` from an update-payload
     */
    private sanitizePayload(payload: any): any {
        delete payload.user_ids; // This must not be sent
        delete payload.admin_ids; // This must not be sent
        return payload;
    }

    private enableFormControls(): void {
        Object.keys(this.meetingForm.controls).forEach(controlName => this.meetingForm.get(controlName)!.enable());
    }

    private goBack(): void {
        this.router.navigate([`committees`, this.committeeId]);
    }

    private makeDatesValid(): void {
        if (!this.isTimeValid) {
            if (this._lastDateSet === `end`) {
                this.meetingForm.controls[`start_time`].setValue(this.meetingForm.get(`end_time`).value);
            } else {
                this.meetingForm.controls[`end_time`].setValue(this.meetingForm.get(`start_time`).value);
            }
        }
        this._lastDateSet = null;
    }
}
