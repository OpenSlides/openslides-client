import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { availableTranslations } from 'src/app/domain/definitions/languages';
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
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { RoutingStateService } from 'src/app/ui/modules/head-bar/services/routing-state.service';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models';

const ADD_MEETING_LABEL = _(`New meeting`);
const EDIT_MEETING_LABEL = _(`Edit meeting`);

const ORGA_ADMIN_ALLOWED_CONTROLNAMES = [`admin_ids`];

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
    public readonly translations = availableTranslations;

    public availableMeetingsObservable: Observable<Selectable[]> | null = null;

    public get isValid(): boolean {
        return this.meetingForm?.valid;
    }

    public get isTimeValid(): boolean {
        const time = this.daterangeControl.value;
        const start = time.start;
        const end = time.end;
        if ((start === null) !== (end === null)) {
            return false;
        }
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

    public isCreateView = false;

    public meetingForm!: UntypedFormGroup;
    public theDuplicateFromId: Id | null = null;

    public sortFn: (valueA: Selectable, valueB: Selectable) => number = (a, b) => {
        return a && typeof a.getTitle() === `string` ? a.getTitle().localeCompare(b.getTitle()) : -1;
    };

    public committee!: ViewCommittee;

    public get meetingUsers(): ViewUser[] {
        return this.editMeeting?.calculated_users || [];
    }

    private meetingId: Id | null = null;
    private editMeeting: ViewMeeting | null = null;
    private committeeId!: Id;

    private cameFromList = false;

    /**
     * The operating user received from the OperatorService
     */
    private operatingUser: ViewUser | null = null;

    private get daterangeControl(): AbstractControl {
        return this.meetingForm?.get(`daterange`);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private meetingRepo: MeetingControllerService,
        private committeeRepo: CommitteeControllerService,
        public orgaTagRepo: OrganizationTagControllerService,
        private orgaSettings: OrganizationSettingsService,
        private operator: OperatorService,
        private userRepo: UserControllerService,
        private openslidesRouter: OpenSlidesRouterService,
        private orga: OrganizationService,
        private routingState: RoutingStateService
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
        this.cameFromList = this.routingState.previousUrl?.includes(`meetings`);
        this.subscriptions.push(
            this.operator.userObservable.subscribe(user => {
                // We need here the user from the operator, because the operator holds not all groups in all meetings they are
                this.operatingUser = user;
                this.onAfterCreateForm();
            })
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
        if (id) {
            this.meetingForm.get(`language`)?.setValue(this.meetingRepo.getViewModel(id).language);
        }
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
            location: [``],
            daterange: [
                {
                    start: null,
                    end: null
                }
            ],
            admin_ids: [[], Validators.minLength(1)],
            organization_tag_ids: [[]],
            external_id: [``]
        };

        rawForm[`language`] = [this.orgaSettings.instant(`default_language`)];

        if (this.isJitsiManipulationAllowed) {
            rawForm[`jitsi_domain`] = [``, Validators.pattern(/^(?!https:\/\/).*[^\/]$/)];
            rawForm[`jitsi_room_name`] = [``];
            rawForm[`jitsi_room_password`] = [``];
        }

        this.meetingForm = this.formBuilder.group(rawForm);
        this.onAfterCreateForm();
    }

    private onAfterCreateForm(): void {
        this.enableFormControls();
        if (!this.operator.isSuperAdmin && !this.isMeetingAdmin && !this.isCreateView) {
            Object.keys(this.meetingForm.controls).forEach(controlName => {
                if (!ORGA_ADMIN_ALLOWED_CONTROLNAMES.includes(controlName)) {
                    this.meetingForm.get(controlName)!.disable();
                } else if (!this.isCreateView && controlName === `language`) {
                    this.meetingForm.get(controlName)!.disable();
                }
            });
        }
    }

    private updateForm(meeting: ViewMeeting): void {
        const start_time = meeting.start_time ? new Date(meeting.start_time * 1000) : null;
        const end_time = meeting.end_time ? new Date(meeting.end_time * 1000) : null;
        const {
            start_time: start,
            end_time: end,
            ...patchMeeting
        }: any = meeting.getUpdatedModelData({
            start_time: start_time,
            end_time: end_time,
            admin_ids: [...(meeting.admin_group?.calculated_user_ids || [])]
        } as any);
        const patchDaterange = {
            start,
            end
        };
        this.meetingForm.patchValue(patchMeeting);
        this.daterangeControl?.patchValue(patchDaterange);
        this.onAfterCreateForm();
    }

    private updateFormByCommittee(): void {
        if (this.isCreateView) {
            let name = this.committee?.name;
            if (this.committee?.meeting_ids?.length > 0) {
                name = `${name} (${this.committee?.meeting_ids?.length + 1 || 1})`;
            }

            const update: any = {
                name
            };
            if ((this.committee?.user_ids || []).includes(this.operator.operatorId!)) {
                update.admin_ids = [this.operator.operatorId];
            }
            this.meetingForm.patchValue(update);
        }
    }

    private async doCreateMeeting(): Promise<void> {
        if (this.theDuplicateFromId) {
            const from = { meeting_id: this.theDuplicateFromId, ...this.getPayload() };
            delete from.language;
            await this.meetingRepo.duplicateFrom(this.committeeId, from).resolve();
        } else {
            const payload = { committee_id: this.committeeId, ...this.getPayload() };
            await this.meetingRepo.create(payload).resolve();
        }
        this.goBack();
    }

    private async doUpdateMeeting(): Promise<void> {
        await this.meetingRepo.update(this.sanitizePayload(this.getPayload()), {
            meeting: this.editMeeting!,
            options: this.getUsersToUpdateForMeetingObject()
        });
        this.goBack();
    }

    private getPayload(): any {
        const { daterange: { start: start_time, end: end_time } = { start: null, end: null }, ...rawPayload } = {
            ...this.meetingForm.value
        };
        return { start_time, end_time, ...rawPayload };
    }

    /**
     * Creates an object containing added and removed participant-user-ids as well as
     * added and removed admin-user-ids for the current editted meeting.
     *
     * @returns A `MeetingUserModifiedFields`-object containing the keys `addedUsers`, `removedUsers`, `addedAdmins`
     * and `removedAdmins`
     */
    private getUsersToUpdateForMeetingObject(): MeetingUserModifiedFields {
        const nextAdminIds = this.meetingForm.value.admin_ids as Id[];
        const previousAdminIds = this.editMeeting!.admin_group.calculated_user_ids || [];
        const addedAdminIds = (nextAdminIds || []).difference(previousAdminIds);
        const removedAdminIds = previousAdminIds.difference(nextAdminIds);

        return {
            addedAdmins: addedAdminIds.map(id => this.userRepo.getViewModel(id) as ViewUser),
            removedAdmins: removedAdminIds.map(id => this.userRepo.getViewModel(id) as ViewUser)
        };
    }

    /**
     * Removes the `language`, `user_ids` and `admin_ids` from an update-payload
     */
    private sanitizePayload(payload: any): any {
        delete payload.admin_ids; // This must not be sent
        delete payload.language;
        return payload;
    }

    private enableFormControls(): void {
        Object.keys(this.meetingForm.controls).forEach(controlName => {
            if (this.isCreateView || controlName !== `language`) {
                this.meetingForm.get(controlName)!.enable();
            }
        });
    }

    private goBack(): void {
        if (this.cameFromList) {
            this.router.navigate([`meetings`]);
        } else {
            this.router.navigate([`committees`, this.committeeId]);
        }
    }

    private makeDatesValid(endDateChanged: boolean): void {
        if (!this.isTimeValid) {
            const patchValue = endDateChanged ? this.daterangeControl?.value.end : this.daterangeControl?.value.start;
            this.daterangeControl?.patchValue({ start: patchValue, end: patchValue });
        }
    }
}
