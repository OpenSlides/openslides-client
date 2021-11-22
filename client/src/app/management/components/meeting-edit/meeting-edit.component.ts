import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MeetingAction } from 'app/core/actions/meeting-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import {
    MeetingRepositoryService,
    MeetingUserModifiedFields
} from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Observable } from 'rxjs';

import { MemberService } from '../../../core/core-services/member.service';
import { SimplifiedModelRequest } from '../../../core/core-services/model-request-builder.service';
import { ORGANIZATION_ID, OrganizationService } from '../../../core/core-services/organization.service';
import { ViewOrganization } from '../../models/view-organization';

const ADD_MEETING_LABEL = _(`New meeting`);
const EDIT_MEETING_LABEL = _(`Edit meeting`);

const ORGA_ADMIN_ALLOWED_CONTROLNAMES = [`user_ids`, `admin_ids`];
const USER_GROUPS_FOLLOW_FN = (meetingId: Id) => ({
    idField: `user_ids`,
    fieldset: `shortName`,
    follow: [{ idField: { templateIdField: `group_$_ids`, templateValue: meetingId.toString() } }]
});
@Component({
    selector: `os-meeting-edit`,
    templateUrl: `./meeting-edit.component.html`,
    styleUrls: [`./meeting-edit.component.scss`]
})
export class MeetingEditComponent extends BaseModelContextComponent implements OnInit {
    public readonly CML = CML;
    public readonly OML = OML;

    public get availableUsers(): Observable<ViewUser[]> {
        return this.userRepo.getViewModelListObservable();
    }

    public get availableMeetingsObservable(): Observable<ViewMeeting[]> {
        return this.orga.organization.active_meetings_as_observable;
    }

    private get isJitsiManipulationAllowed(): boolean {
        return !this.isCreateView && this.operator.isSuperAdmin;
    }

    private get isMeetingAdmin(): boolean {
        return this.operatingUser?.group_ids(this.meetingId).includes(this.editMeeting?.admin_group_id);
    }

    public addMeetingLabel = ADD_MEETING_LABEL;
    public editMeetingLabel = EDIT_MEETING_LABEL;

    public isCreateView: boolean;

    public meetingForm: FormGroup;
    public theDuplicateFromId: Id;

    public committee: ViewCommittee;

    private meetingId: number;
    private editMeeting: ViewMeeting;
    private committeeId: number;

    /**
     * The operating user received from the OperatorService
     */
    private operatingUser: ViewUser;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private meetingRepo: MeetingRepositoryService,
        private committeeRepo: CommitteeRepositoryService,
        public orgaTagRepo: OrganizationTagRepositoryService,
        private operator: OperatorService,
        private userRepo: UserRepositoryService,
        private orga: OrganizationService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector, translate);
        this.createOrEdit();
        this.createForm();
        this.getRouteParams();

        if (this.isCreateView) {
            super.setTitle(ADD_MEETING_LABEL);
        } else {
            super.setTitle(EDIT_MEETING_LABEL);
        }
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.operator.userObservable.subscribe(user => {
                // We need here the user from the operator, because the operator holds not all groups in all meetings they are
                this.operatingUser = user;
                this.onAfterCreateForm();
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
        const currentValue: Id[] = this.meetingForm.get(`organization_tag_ids`).value || [];
        this.meetingForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
    }

    public onUpdateDuplicateFrom(id: Id | null): void {
        this.theDuplicateFromId = id;
        if (id) {
            this.meetingForm.get(`user_ids`).disable();
            this.meetingForm.get(`admin_ids`).disable();
        } else if (id === null) {
            this.meetingForm.get(`user_ids`).enable();
            this.meetingForm.get(`admin_ids`).enable();
        }
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [ORGANIZATION_ID],
            follow: [`active_meeting_ids`],
            fieldset: ``
        };
    }

    private createOrEdit(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === `create`) {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
        }
    }

    private getRouteParams(): void {
        this.subscriptions.push(
            this.route.params.subscribe(async params => {
                this.committeeId = Number(params.committeeId);
                this.meetingId = Number(params.meetingId);

                if (this.meetingId) {
                    this.loadMeeting();
                }
                if (this.committeeId) {
                    this.loadCommittee();
                }
                this.loadUsers();
            })
        );
    }

    private loadMeeting(): void {
        this.requestModels(
            {
                viewModelCtor: ViewMeeting,
                ids: [this.meetingId],
                follow: [
                    USER_GROUPS_FOLLOW_FN(this.meetingId),
                    {
                        idField: `admin_group_id`,
                        follow: [USER_GROUPS_FOLLOW_FN(this.meetingId)]
                    },
                    {
                        idField: `default_group_id`,
                        follow: [USER_GROUPS_FOLLOW_FN(this.meetingId)]
                    }
                ],
                fieldset: `edit`
            },
            `meeting`
        );
        this.subscriptions.push(
            this.meetingRepo.getViewModelObservable(this.meetingId).subscribe(meeting => {
                if (meeting) {
                    this.editMeeting = meeting;
                    this.updateForm(this.editMeeting);
                }
            })
        );
    }

    private loadCommittee(): void {
        this.requestModels(
            {
                viewModelCtor: ViewCommittee,
                ids: [this.committeeId],
                follow: [USER_GROUPS_FOLLOW_FN(this.meetingId)],
                fieldset: `list`
            },
            `committee`
        );
        this.subscriptions.push(
            this.committeeRepo.getViewModelObservable(this.committeeId).subscribe(committee => {
                if (committee) {
                    this.committee = committee;
                    this.updateFormByCommittee();
                }
            })
        );
    }

    private async loadUsers(): Promise<void> {
        const simplifiedRequest = await this.memberService.getAllOrgaUsersModelRequest();
        this.requestModels(simplifiedRequest);
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
            rawForm.jitsi_domain = [``];
            rawForm.jitsi_room_name = [``];
            rawForm.jitsi_room_password = [``];
            rawForm.enable_chat = [false];
        }

        this.meetingForm = this.formBuilder.group(rawForm);
        this.onAfterCreateForm();
    }

    private onAfterCreateForm(): void {
        this.enableFormControls();
        if (!this.isMeetingAdmin) {
            Object.keys(this.meetingForm.controls).forEach(controlName => {
                if (!ORGA_ADMIN_ALLOWED_CONTROLNAMES.includes(controlName)) {
                    this.meetingForm.get(controlName).disable();
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
            if ((this.committee?.user_ids || []).includes(this.operator.operatorId)) {
                update.admin_ids = [this.operator.operatorId];
            }
            this.meetingForm.patchValue(update);
        }
    }

    private async doCreateMeeting(): Promise<void> {
        if (this.theDuplicateFromId) {
            const identifiable = (await this.meetingRepo.duplicateFrom(this.committeeId, this.theDuplicateFromId))[0];
            const payload: MeetingAction.UpdatePayload = {
                id: identifiable.id,
                ...this.meetingForm.value
            };
            await this.meetingRepo.update(this.sanitizePayload(payload));
        } else {
            const payload: MeetingAction.CreatePayload = {
                committee_id: this.committeeId,
                ...this.meetingForm.value
            };

            await this.meetingRepo.create(payload);
        }
        this.goBack();
    }

    private async doUpdateMeeting(): Promise<void> {
        const payload: MeetingAction.UpdatePayload = { ...this.meetingForm.value };
        await this.meetingRepo.update(
            this.sanitizePayload(payload),
            this.editMeeting,
            this.getUsersToUpdateForMeetingObject()
        );
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
        const previousUserIds = this.editMeeting.default_group.user_ids || [];
        const addedUserIds = (nextUserIds || []).difference(previousUserIds);
        const removedUserIds = previousUserIds.difference(nextUserIds);
        const nextAdminIds = this.meetingForm.value.admin_ids as Id[];
        const previousAdminIds = this.editMeeting.admin_group.user_ids || [];
        const addedAdminIds = (nextAdminIds || []).difference(previousAdminIds);
        const removedAdminIds = previousAdminIds.difference(nextAdminIds);

        return {
            addedUsers: addedUserIds.map(id => this.userRepo.getViewModel(id)),
            removedUsers: removedUserIds.map(id => this.userRepo.getViewModel(id)),
            addedAdmins: addedAdminIds.map(id => this.userRepo.getViewModel(id)),
            removedAdmins: removedAdminIds.map(id => this.userRepo.getViewModel(id))
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
        Object.keys(this.meetingForm.controls).forEach(controlName => this.meetingForm.get(controlName).enable());
    }

    private goBack(): void {
        this.router.navigate([`committees`, this.committeeId]);
    }
}
