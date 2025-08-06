import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { availableTranslations } from 'src/app/domain/definitions/languages';
import { OML } from 'src/app/domain/definitions/organization-permission';
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
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { RoutingStateService } from 'src/app/ui/modules/head-bar/services/routing-state.service';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models';

const ADD_MEETING_LABEL = _(`New meeting`);
const EDIT_MEETING_LABEL = _(`Edit meeting`);

const ORGA_ADMIN_ALLOWED_CONTROLNAMES = [`admin_ids`];
const SUPERADMIN_CLOSED_MEETING_ALLOWED_CONTROLNAMES = [`jitsi_domain`, `jitsi_room_name`, `jitsi_room_password`];

@Component({
    selector: `os-meeting-edit`,
    templateUrl: `./meeting-edit.component.html`,
    styleUrls: [`./meeting-edit.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MeetingEditComponent extends BaseComponent implements OnInit {
    public readonly availableUsers: Observable<ViewUser[]>;
    public readonly translations = availableTranslations;

    public availableMeetingsObservable: Observable<Selectable[]> | null = null;

    public get isValid(): boolean {
        if (this.isCommitteeManagerAndRequireDuplicateFrom) {
            if (!this.theDuplicateFromId && this.isCreateView) {
                return false;
            }
        }
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

    public sortFn: (valueA: Selectable, valueB: Selectable) => number = (a, b): number => {
        return a && typeof a.getTitle() === `string` ? a.getTitle().localeCompare(b.getTitle()) : -1;
    };

    public committee!: ViewCommittee;
    public availableAdmins: ViewUser[] = [];

    private meetingId: Id | null = null;
    private editMeeting: ViewMeeting | null = null;
    private committeeId!: Id;

    private cameFromList = false;
    private requireDuplicateFrom = false;

    /**
     * The operating user received from the OperatorService
     */
    private operatingUser: ViewUser | null = null;
    private _committee_users_set = new Set<Id>();

    private get daterangeControl(): AbstractControl {
        return this.meetingForm?.get(`daterange`);
    }

    public constructor(
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
        super();
        this.checkCreateView();
        this.createForm();
        this.init();

        if (this.isCreateView) {
            super.setTitle(ADD_MEETING_LABEL);
        } else {
            super.setTitle(EDIT_MEETING_LABEL);
            this.meetingForm.get(`language`)?.disable();
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
            }),
            this.operator.user.committee_managements$.subscribe(committees => {
                this._committee_users_set = new Set(committees.flatMap(committee => committee.user_ids ?? []));
            })
        );
        this.subscriptions.push(
            this.orgaSettings
                .get(`require_duplicate_from`)
                .subscribe((value: boolean) => (this.requireDuplicateFrom = value))
        );

        this.availableMeetingsObservable = this.orga.organizationObservable.pipe(
            map(organization => {
                return [...organization.template_meetings.sort(this.sortFn)];
            })
        );
        this.availableAdmins = this.filterAccountsForCommitteeAdmins(this.userRepo.getViewModelList());
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
            this.meetingForm.get(`language`)?.disable();
        } else {
            this.meetingForm.get(`language`)?.enable();
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

        const rawForm: Record<string, any> = {
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
            rawForm[`jitsi_domain`] = [``, Validators.pattern(/^(?!https:\/\/).*[^/]$/)];
            rawForm[`jitsi_room_name`] = [``];
            rawForm[`jitsi_room_password`] = [``];
        }
        if (this.isCreateView) {
            rawForm[`set_as_template`] = [false];
        }

        this.meetingForm = this.formBuilder.group(rawForm);
        this.onAfterCreateForm();
    }

    private onAfterCreateForm(): void {
        this.enableFormControls();
        const canSkip =
            this.operator.canSkipPermissionCheck || this.operator.hasCommitteeManagementRights(this.committeeId);
        if (!canSkip && !this.isMeetingAdmin && !this.isCreateView) {
            Object.keys(this.meetingForm.controls).forEach(controlName => {
                if (!ORGA_ADMIN_ALLOWED_CONTROLNAMES.includes(controlName)) {
                    this.meetingForm.get(controlName)!.disable();
                } else if (!this.isCreateView && controlName === `language`) {
                    this.meetingForm.get(controlName)!.disable();
                }
            });
        }
        if (canSkip && !this.isMeetingAdmin && this.editMeeting?.locked_from_inside) {
            Object.keys(this.meetingForm.controls).forEach(controlName => {
                if (!SUPERADMIN_CLOSED_MEETING_ALLOWED_CONTROLNAMES.includes(controlName)) {
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
        const options =
            (this.operator.canSkipPermissionCheck || this.operator.hasCommitteeManagementRights(this.committeeId)) &&
            !this.isMeetingAdmin &&
            this.editMeeting?.locked_from_inside
                ? {}
                : this.getUsersToUpdateForMeetingObject();
        await this.meetingRepo.update(this.sanitizePayload(this.getPayload()), {
            meeting: this.editMeeting!,
            options: options
        });
        this.goBack();
    }

    private getPayload(): any {
        const { daterange: { start: start_time, end: end_time } = { start: null, end: null }, ...rawPayload } = {
            ...this.meetingForm.value
        };
        if (!this.meetingForm.get(`daterange`).disabled) {
            return { start_time, end_time, ...rawPayload };
        }
        return { ...rawPayload };
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

    public get isCommitteeManagerAndRequireDuplicateFrom(): boolean {
        return this.requireDuplicateFrom && !this.operator.isOrgaManager;
    }

    private filterAccountsForCommitteeAdmins(accounts: ViewUser[]): ViewUser[] {
        if (this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return accounts;
        }
        return accounts.filter(account => this._committee_users_set.has(account.id));
    }
}
